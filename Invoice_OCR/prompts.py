import json

def get_invoice_ocr_prompt(expected_skus: dict[str, str]) -> str:
    # Serialize the SKU-to-Unit dictionary into a formatted string for the LLM context context window.
    # This establishes explicit mathematical targets for the model's unit conversion logic.
    sku_mapping_str = json.dumps(expected_skus, indent=2)

    prompt = f"""
    You are an expert data extraction AI, designed to return ONLY valid JSON.
    Analyze the provided invoice image, extract the line items, and map them to the provided authorized SKU mapping.

    **AUTHORIZED SKU MAPPING (SKU -> Required Unit):**
    {sku_mapping_str}

    **CRITICAL RULES:**
    1.  **JSON ONLY:** Your response MUST be a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON.
    2.  **STRICT MAPPING:** Compare the physical invoice items to the keys in the AUTHORIZED SKU MAPPING. Map the vendor's description to the closest matching authorized SKU based on semantic meaning.
    3.  **IGNORE UNMATCHED:** If an item cannot be logically mapped to ANY key in the AUTHORIZED SKU MAPPING, completely ignore it.
    4.  **UNIT CONVERSION & NORMALIZATION:** You MUST convert the physical invoice quantity to the EXACT required unit specified for that SKU in the AUTHORIZED SKU MAPPING.
        - Example: If the invoice says "500g" and the required unit is "KG", extract quantity as 0.5 and unit as "KG".
        - Example: If the invoice says "2 Dozen" and the required unit is "Pc", extract quantity as 24 and unit as "Pc".
        - Price Adjustment: If a unit conversion occurs, you MUST adjust the `price_per_unit` accordingly so that `quantity` * `price_per_unit` equals the `total_price` physically printed on the invoice.
    5.  **NO GUESSING OTHER VALUES:** Only extract data physically visible. Do not calculate missing values except for required unit/price adjustments. Use `null` if missing.
    6.  **STRICT SCHEMA:** Adhere to this exact JSON schema:
        {{
            "invoice_number": "string or null",
            "date": "YYYY-MM-DD string or null",
            "items": [
                {{
                    "mapped_sku": "string (MUST exactly match a key in the AUTHORIZED SKU MAPPING)",
                    "quantity": "number or null",
                    "unit": "string (MUST exactly match the value paired with the SKU in the AUTHORIZED SKU MAPPING)",
                    "price_per_unit": "number or null",
                    "total_price": "number or null"
                }}
            ]
        }}
    """
    return prompt