from pydantic import BaseModel, Field, ValidationInfo, model_validator
from typing import List, Optional, Literal

class Item(BaseModel):
    mapped_sku: str = Field(..., description="The authorized SKU name mapped from the invoice")
    quantity: Optional[float] = None
    unit: Optional[Literal['KG', 'Liters', 'Pieces']] = Field(None, description="'KG', 'Liters', 'Pieces' only")
    price_per_unit: Optional[float] = None
    total_price: Optional[float] = None

    @model_validator(mode='after')
    def validate_sku_and_unit(self, info: ValidationInfo):
        # Retrieve the dictionary context containing strict SKU to Unit mappings
        authorized_sku_mapping = info.context.get('authorized_skus') if info.context else {}
        
        # Bypass validation if context is missing during schema initialization
        if not authorized_sku_mapping:
            return self

        # Validate existence of SKU key
        if self.mapped_sku not in authorized_sku_mapping:
            raise ValueError(f"SKU '{self.mapped_sku}' is not in the authorized SKU list: {list(authorized_sku_mapping.keys())}")

        # Enforce strict adherence to the predefined master unit
        expected_unit = authorized_sku_mapping[self.mapped_sku]
        if self.unit != expected_unit:
            raise ValueError(f"Unit '{self.unit}' for SKU '{self.mapped_sku}' does not match the required database unit '{expected_unit}'")

        return self

class InvoiceData(BaseModel):
    invoice_number: Optional[str] = Field(None, description="Extract the invoice or bill number")
    date: Optional[str] = Field(None, description="Extract the date in YYYY-MM-DD format")
    items: List[Item]