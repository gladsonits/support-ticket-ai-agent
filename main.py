from langgraph.langgraph_main import langgraph_workflow as langgraph_app
import traceback
import os
from models.ticket import TicketRequest, TicketResponse
from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv
from datetime import datetime
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="AI Support Ticket Routing API",
    description="Processes incoming support tickets through security, scrubbing, analytics, and classification pipelines."
)

# Add CORS middleware to allow requests from front-end development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: Verify it loaded correctly without printing the full secret
print(f"Token loaded: {os.environ.get('HF_TOKEN') is not None}")

# 1. Compile the workflow once at app startup
# This produces the compiled runnable that has .ainvoke() available
compiled_graph = langgraph_app.compile_workflow()

# =====================================================================
# 2. FastAPI Endpoint Integration
# =====================================================================

# Add this exact block right below your 'app = FastAPI()' declaration


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 1. Print it to your terminal console immediately
    print("\n💥 CRITICAL REVEALED ERROR:")
    traceback.print_exception(type(exc), exc, exc.__traceback__)

    # 2. Return it to your Postman/browser client so you see it instantly
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc),
            "traceback": traceback.format_exception(type(exc), exc, exc.__traceback__)
        }
    )


@app.get("/")
def read_root():
    return {"message": "App is running!"}


@app.post("/api/v1/tickets/process", response_model=TicketResponse)
async def process_support_ticket(payload: TicketRequest):
    """
    Receives a raw support ticket text, executes the LangGraph workflow state machine
    asynchronously, and returns the fully enriched, categorized metadata payload.
    """
    if not payload.raw_description.strip():
        raise HTTPException(
            status_code=400, detail="Ticket description cannot be empty.")

    # 1. Initialize the starting state dictionary matching your SupportTicketState keys
    initial_state = {
        "createddate": datetime.utcnow(),
        "rawdescription": payload.raw_description,
        "anonymizeddescription": "",
        "pii": [],
        "promptinjection": {},
        "sentiment": {},
        "ai_summary": "",
        "category": {}
    }

    # 2. Invoke the graph asynchronously using .ainvoke()
    # This executes every node sequentially (or conditionally) across your pipeline
    final_state = await compiled_graph.ainvoke(initial_state)

    # 3. Handle security fallback condition
    # (If your conditional edge routed immediately to END due to a prompt injection)
    security_data = final_state.get("promptinjection", {})
    if security_data and not security_data.get("is_safe", True):
        return TicketResponse(
            status="rejected",
            message="Processing halted. Security threat or prompt injection detected.",
            data={"promptinjection": security_data}
        )

    # 4. Return successful enriched state payload
    return TicketResponse(
        status="success",
        message="Ticket successfully scrubbed, analyzed, and classified.",
        data=final_state
    )
