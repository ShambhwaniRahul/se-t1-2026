# schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

class FormulationIngredient(BaseModel):
    """
    Defines a single ingredient required for the new product formulation.
    """
    name: str = Field(
        ..., 
        description="The standardized name of the ingredient."
    )
    percentage_or_weight: str = Field(
        ..., 
        description="The required amount, preferably in metric weight or formulation percentage."
    )
    is_target_ingredient: bool = Field(
        ..., 
        description="True if this ingredient was sourced from the mandatory target ingredients list. False if it is an external addition."
    )
    purpose: str = Field(
        ..., 
        description="The functional role of this ingredient in the product (e.g., 'primary base', 'emulsifier', 'flavor enhancer')."
    )

class ProductionStep(BaseModel):
    """
    Defines a sequential step in the manufacturing or preparation process.
    """
    step_number: int = Field(
        ..., 
        description="The sequential execution order of the step."
    )
    instruction: str = Field(
        ..., 
        description="Clear, actionable instruction for this phase of production."
    )
    critical_parameters: Optional[str] = Field(
        default=None, 
        description="Any crucial environmental or physical parameters (e.g., 'Heat to 85°C', 'Mix at 2000 RPM for 5 mins')."
    )

class ProductInnovationResult(BaseModel):
    """
    The root schema representing the complete, differentiated product concept and recipe.
    """
    product_name: str = Field(
        ..., 
        description="A commercially viable name for the new product."
    )
    category: str = Field(
        ..., 
        description="The general market category the product falls into (e.g., 'RTD Beverage', 'Savory Snack')."
    )
    differentiation_analysis: str = Field(
        ..., 
        description="A detailed explanation of how this product distinctly differs from the provided Existing Product Catalog."
    )
    unique_selling_proposition: str = Field(
        ..., 
        description="A concise statement defining the primary market appeal or functionality of the product."
    )
    formulation: List[FormulationIngredient] = Field(
        ..., 
        description="The complete bill of materials required to manufacture the product."
    )
    production_process: List[ProductionStep] = Field(
        ..., 
        description="The step-by-step manufacturing instructions."
    )

class ExpiringIngredient(BaseModel):
    """
    Defines an ingredient that needs to be utilized to prevent waste.
    """
    name: str = Field(..., description="Name of the ingredient.")
    quantity_available: str = Field(..., description="Volume or weight available for production.")
    properties: str = Field(default="", description="Optional physical or flavor properties.")

class ExistingProduct(BaseModel):
    """
    Defines a product already in the market or catalog to ensure differentiation.
    """
    product_name: str = Field(..., description="Name of the existing product.")
    core_ingredients: List[str] = Field(..., description="Primary ingredients used in this product.")
    flavor_profile: str = Field(default="", description="General flavor profile or category.")

class InnovationRequestPayload(BaseModel):
    """
    Encapsulates the incoming request data for product innovation.
    """
    target_ingredients: List[ExpiringIngredient]
    existing_catalog: List[ExistingProduct]