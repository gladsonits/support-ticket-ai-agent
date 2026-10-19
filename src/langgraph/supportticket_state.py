from typing import Any, TypedDict
from datetime import datetime


class SupportTicketState(TypedDict):
    createddate: datetime
    rawdescription: str
    sanitizeddescription: str
    anonymizeddescription: str
    pii: Any
    promptinjection: Any
    sentiment: Any
    toxicity: Any
    category: Any
