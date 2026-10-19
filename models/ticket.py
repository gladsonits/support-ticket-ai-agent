from pydantic import BaseModel, Field

# =====================================================================
# 2. Define Request and Response Schemas
# =====================================================================


class TicketRequest(BaseModel):
    raw_description: str = Field(
        ...,
        description="The unedited content of the support ticket submitted by the user.",
        example="Hi, my name is John Doe (SSN: 123-45-678). I need help recovering access to account id #9921."
    )


class TicketResponse(BaseModel):
    status: str
    message: str
    data: dict = Field(...,
                       description="The complete processed LangGraph state object.")
