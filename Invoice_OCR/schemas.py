from pydantic import BaseModel, Field, field_validator, ValidationError, ValidationInfo
from typing import List, Optional, Literal

class Item(BaseModel):
    mapped_sku: str = Field(..., description="The authorized SKU name mapped from the invoice")
    quantity: Optional[float] = None
    unit: Optional[Literal['KG', 'L', 'Pc']] = Field(None, description="'KG', 'L', 'Pc' only")
    price_per_unit: Optional[float] = None
    total_price: Optional[float] = None

    @field_validator('mapped_sku')
    def validate_sku(cls, v: str, info: ValidationInfo):
        # Evaluate the extracted SKU against the injected context list
        authorized_skus = info.context.get('authorized_skus') if info.context else []
        if authorized_skus and v not in authorized_skus:
            raise ValueError(f"SKU '{v}' is not in the authorized SKU list: {authorized_skus}")
        return v

class InvoiceData(BaseModel):
    invoice_number: Optional[str] = Field(None, description="Extract the invoice or bill number")
    date: Optional[str] = Field(None, description="Extract the date in YYYY-MM-DD format")
    items: List[Item]