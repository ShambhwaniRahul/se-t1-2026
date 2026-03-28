# app.py
from fastapi import FastAPI, HTTPException
import uvicorn

from schemas import InnovationRequestPayload, ProductInnovationResult
from utils import generate_innovative_product

app = FastAPI(
    title="Product Innovation Engine API",
    description="API for generating net-new product formulations via LLM.",
    version="1.0.0"
)


@app.post("/innovate/", response_model=ProductInnovationResult)
async def innovate_product(request: InnovationRequestPayload):
    """
    Endpoint to process raw materials and existing catalogs into a new product concept.
    """
    try:
        ingredients_context = "Expiring Ingredients Available:\n"
        for item in request.target_ingredients:
            ingredients_context += f"- {item.name} ({item.quantity_available}). Properties: {item.properties}\n"

        catalog_context = "Current Product Catalog (Avoid Duplication):\n"
        if not request.existing_catalog:
            catalog_context += "- No existing catalog provided.\n"
        else:
            for prod in request.existing_catalog:
                core_ing = ", ".join(prod.core_ingredients)
                catalog_context += f"- {prod.product_name} | Flavor: {prod.flavor_profile} | Base: {core_ing}\n"

        result = await generate_innovative_product(
            ingredients_list=ingredients_context,
            existing_items_list=catalog_context
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Product innovation generation failed: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)