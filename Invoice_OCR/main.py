from fastapi import FastAPI, File, UploadFile, HTTPException
import io
import os
from dotenv import load_dotenv
from schemas import InvoiceData
from prompts import get_invoice_ocr_prompt
import uvicorn

# Correct PydanticAI imports for 2026
from pydantic_ai import Agent, BinaryContent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

load_dotenv()

app = FastAPI()

# Authentication Setup
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Initialize the Provider and Model correctly
provider = GoogleProvider(api_key=api_key)
model = GoogleModel('gemini-2.5-flash', provider=provider)

# Define the Agent using 'output_type' and 'system_prompt'
agent = Agent(
    model,
    output_type=InvoiceData,
    system_prompt=get_invoice_ocr_prompt()
)

@app.post("/scan/", response_model=InvoiceData)
async def scan_invoice(file: UploadFile = File(...)):
    """
    Processes an invoice image using PydanticAI Agent with native multimodal support.
    """
    try:
        # Read raw bytes directly from the upload
        contents = await file.read()
        if not contents:
            raise ValueError("Empty file uploaded.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File error: {str(e)}")

    try:
        # Run the agent with a list of content parts (Text + Image)
        result = await agent.run(
            [
                "Please extract the data from this invoice image.",
                BinaryContent(data=contents, media_type=file.content_type)
            ]
        )

        # The validated object is available in result.output
        return result.output

    except Exception as e:
        print(f"Extraction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="The AI failed to parse the invoice according to the required schema."
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)