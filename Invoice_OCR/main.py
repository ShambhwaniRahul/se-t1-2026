from fastapi import FastAPI, File, UploadFile, HTTPException, Form
import io
import os
from dotenv import load_dotenv
from schemas import InvoiceData
from prompts import get_invoice_ocr_prompt
import uvicorn

from pydantic_ai import Agent, BinaryContent, RunContext
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

load_dotenv()

app = FastAPI()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

provider = GoogleProvider(api_key=api_key)
model = GoogleModel('gemini-2.5-flash', provider=provider)

# Agent definition utilizes dependency injection for runtime variables
agent = Agent(
    model,
    output_type=InvoiceData,
    deps_type=list[str]
)

@agent.system_prompt
def generate_dynamic_system_prompt(ctx: RunContext[list[str]]) -> str:
    # Injects the runtime dependencies into the prompt generation function
    return get_invoice_ocr_prompt(ctx.deps)

@app.post("/scan/", response_model=InvoiceData)
async def scan_invoice(
    expected_skus: list[str] = Form(..., description="List of authorized SKUs passed as multiple form fields"),
    file: UploadFile = File(...)
):
    """
    Processes an invoice image using PydanticAI Agent with dynamic SKU constraints.
    """
    try:
        contents = await file.read()
        if not contents:
            raise ValueError("Empty file uploaded.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File error: {str(e)}")

    try:
        # Execute agent payload with dependencies
        result = await agent.run(
            [
                "Please extract the data from this invoice image.",
                BinaryContent(data=contents, media_type=file.content_type)
            ],
            deps=expected_skus
        )

        # Apply context-aware validation logic defined in the schema
        validated_output = InvoiceData.model_validate(
            result.output.model_dump(), 
            context={'authorized_skus': expected_skus}
        )

        return validated_output

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction or validation failed: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)