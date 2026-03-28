def generate_product_innovation_prompt(ingredients_list: str, existing_items_list: str) -> str:
    """
    Generates the system prompt for the product innovation LLM agent.
    
    Args:
        ingredients_list (str): Formatted string detailing available ingredients to utilize.
        existing_items_list (str): Formatted string detailing the current product catalog.
        
    Returns:
        str: The fully constructed prompt utilizing f-strings for context injection.
    """

    prompt = f"""
        You are an expert Food Scientist and R&D Product Developer.
        Your task is to conceptualize a net-new product and formulate its recipe based on the provided parameters.

        INPUT DATA:
        1. Target Ingredients (Must Utilize):
        {ingredients_list}

        2. Existing Product Catalog (Must Differentiate From):
        {existing_items_list}

        OPERATIONAL RULES:
        1. Strict Differentiation: The generated product must not be a direct copy or minor flavor variation of any item in the Existing Product Catalog. It must occupy a distinct market niche.
        2. Ingredient Utilization: Prioritize the Target Ingredients as the foundational components of the new formulation.
        3. Recipe Formulation: Provide clear, sequential recipe instructions suitable for scaled production.
        4. Structural Compliance: Output the final concept and recipe strictly matching the requested data schema.
    """
    return prompt
