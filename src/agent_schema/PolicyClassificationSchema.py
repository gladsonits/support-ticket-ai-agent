# 1. Keep the Pydantic schema strictly for the data structure
from pydantic import BaseModel, Field
from typing import Literal


class PolicyClassificationSchema(BaseModel):
    category: Literal["New Policy", "Renewal", "Policy Updates/Cancels", "Operations", "Payment", "Service Request", "Claims", "Unknown"] = Field(
        description="The primary policy category that this text falls under. If the text does not clearly fit into one of the predefined categories, classify it as 'Unknown'."
    )
    urgency: Literal["Low", "Medium", "High", "Critical"] = Field(
        description="The urgency level based on the risk or impact of the issue."
    )
    summary: str = Field(
        description="A brief, one-sentence summary of the user's request or issue."
    )
    confidence_score: float = Field(
        description="Confidence score between 0.0 and 1.0 for this classification."
    )
