# utils.py
import os
from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

from schemas import ProductInnovationResult
from prompts import generate_product_innovation_prompt

from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# Retrieve API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is missing or undefined.")

# Configure LLM provider and target model
provider = GoogleProvider(api_key=api_key)
model = GoogleModel('gemini-2.5-flash', provider=provider)

# Instantiate the orchestration agent globally to optimize request latency
# output_type parameter forces the LLM output to conform to the defined schema
innovation_agent = Agent(
    model,
    output_type=ProductInnovationResult,
    retries=2
)

async def generate_innovative_product(ingredients_list: str, existing_items_list: str) -> ProductInnovationResult:
    """
    Executes the product innovation pipeline against the language model.
    
    Args:
        ingredients_list (str): Serialized data containing available raw materials.
        existing_items_list (str): Serialized data detailing the baseline product catalog.
        
    Returns:
        ProductInnovationResult: Validated Pydantic object containing the new formulation.
    """
    # Construct the instruction set with injected runtime variables
    execution_prompt = generate_product_innovation_prompt(
        ingredients_list=ingredients_list,
        existing_items_list=existing_items_list
    )
    
    # Execute the model request asynchronously
    result = await innovation_agent.run(execution_prompt)
    
    # Return the structured Pydantic object
    # Note: Using .output or .data depends on the specific pydantic_ai version installed
    return result.output