
def get_invoice_ocr_prompt(expected_skus: list[str]) -> str:
    # Format the list of SKUs into a comma-separated string for prompt injection.
    # The prompt explicitly handles UOM normalization to ensure downstream compatibility.
    allowed_skus_str = ", ".join([f'"{sku}"' for sku in expected_skus])

    prompt = f"""
    You are an expert data extraction AI, designed to return ONLY valid JSON.
    Analyze the provided invoice image, extract the line items, and map them to the provided authorized SKU list.

    **AUTHORIZED SKU LIST:**
    [{allowed_skus_str}]

    **CRITICAL RULES:**
    1.  **JSON ONLY:** Your response MUST be a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON.
    2.  **STRICT MAPPING:** Compare the physical invoice items to the AUTHORIZED SKU LIST. Map the vendor's description to the closest matching authorized SKU based on semantic meaning.
    3.  **IGNORE UNMATCHED:** If an item on the invoice cannot be logically mapped to ANY item in the AUTHORIZED SKU LIST (e.g., shipping fees, unrelated items), completely ignore it. Do not include it in the JSON output.
    4.  **UNIT CONVERSION & NORMALIZATION:** The output unit MUST be one of the following: 'KG', 'L', or 'Pc'. If the invoice uses a different unit of measure (e.g., grams, pounds, milliliters, dozens, boxes), you MUST logically convert the quantity to the appropriate allowed unit.
        - Example: 500g -> 0.5 KG.
        - Example: 2 Dozen -> 24 Pc.
        - If you convert a unit, you MUST adjust the `price_per_unit` accordingly so that `quantity` * `price_per_unit` equals the `total_price` physically printed on the invoice.
    5.  **NO GUESSING OTHER VALUES:** Only extract data physically visible in the image. Except for necessary unit conversions, do not calculate missing values. If a numerical value or date is missing, use `null`.
    6.  **STRICT SCHEMA:** Adhere to this exact JSON schema:
        {{
            "invoice_number": "string or null",
            "date": "YYYY-MM-DD string or null",
            "items": [
                {{
                    "mapped_sku": "string (MUST exactly match one of the items in the AUTHORIZED SKU LIST)",
                    "raw_vendor_description": "string (The exact text written on the invoice)",
                    "quantity": "number or null",
                    "unit": "string (MUST be exactly 'KG', 'L', or 'Pc')",
                    "price_per_unit": "number or null",
                    "total_price": "number or null"
                }}
            ]
        }}
    """
    return prompt