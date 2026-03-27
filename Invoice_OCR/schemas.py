from pydantic import BaseModel, Field
from typing import List, Optional

class Item(BaseModel):
    sku: str = Field(..., description="Name of the ingredient or product")
    quantity: Optional[float] = None
    unit: Optional[str] = Field(None, description="kg, L, pcs, boxes, etc.")
    price_per_unit: Optional[float] = None
    total_price: Optional[float] = None

class InvoiceData(BaseModel):
    invoice_number: Optional[str] = Field(None, description="Extract the invoice or bill number")
    date: Optional[str] = Field(None, description="Extract the date in YYYY-MM-DD format")
    items: List[Item]
