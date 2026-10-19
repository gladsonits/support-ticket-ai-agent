from typing import Dict, Any
from langgraph.supportticket_state import SupportTicketState
from agent_modules.sentiment_toxicanalysis import analysis_module
from agent_modules.llm_prompt_injection import prompt_injection_module
from agent_modules.prompt_injection import prompt_injection_filter
from agent_modules.pii_detection import pii_module
from agent_modules.category_allocation import category_module

# =====================================================================
# 1. Create the LangGraph Node Function - Prompt Injection Detection
# =====================================================================


# def prompt_injection_filter_node(state: SupportTicketState) -> Dict[str, Any]:
#     """
#     LangGraph node that checks for prompt injection in the raw input text.
#     """
#     raw_text = state["rawdescription"]

#     # detect_injection returns True if injection is found, False if safe
#     has_injection = prompt_injection_filter.detect_injection(raw_text)
#     is_safe = not has_injection

#     return {
#         "promptinjection": {
#             "is_safe": is_safe,
#             "label": "SAFE" if is_safe else "INJECTION DETECTED"
#         }
#     }


# =====================================================================
# 1. Create the LangGraph Node Function - PII Detection and Anonymization
# =====================================================================


def pii_scrubber_node(state: SupportTicketState) -> Dict[str, Any]:
    """
    LangGraph node that processes raw text, detects PII, anonymizes it, 
    and returns the keys to update the state.
    """
    # Extract the raw input text from the current state
    raw_text = state["rawdescription"]

    # 1. Run detection
    results = pii_module.analyse_input_for_pii(raw_text)

    # 2. Run anonymization (reusing results so we don't analyze twice)
    anonymized_text = pii_module.anonymize_input(raw_text, results)

    # 3. Serialize Presidio results to a standard dictionary format so
    # LangGraph checkpointing can save it without serialization crashes.
    serialized_pii = [res.to_dict() for res in results]

    # Return ONLY the keys you want to update in the state
    return {
        "anonymizeddescription": anonymized_text,
        "pii": serialized_pii
    }

# =====================================================================
# 2. Create the LangGraph Node Function - Prompt Injection Detection
# =====================================================================

def prompt_injection_check_node(state: SupportTicketState) -> Dict[str, Any]:
    """
    Node that intercepts the raw input, runs the transformer model guardrail,
    and logs safety flags into the state.
    """
    raw_text = state["anonymizeddescription"] # Use anonymized text for security checks to avoid leaking PII

    # Get raw structural result if you want to save scores/probabilities
    raw_results = prompt_injection_module.detect_prompt_injection(raw_text)

    return {
        "promptinjection": {
            "is_safe": raw_results.is_safe,
            "label": "SAFE" if raw_results.is_safe else "INJECTION DETECTED",
            "reason": raw_results.reason
        },
        # If safe, downstream nodes can use this sanitized/verified version
        "sanitizeddescription": raw_results.sanitized_text if raw_results.is_safe else "Input blocked due to security policy."
    }


# =====================================================================
# 3. Create the LangGraph Node Function - Sentiment and Toxicity Analysis
# =====================================================================


def sentiment_analytics_node(state: SupportTicketState) -> Dict[str, Any]:
    """
    LangGraph node that runs both sentiment analysis and toxicity metrics 
    in a single execution pass.
    """
    # Use anonymized description if available to keep user context safe
    text_to_analyze = state.get("anonymizeddescription") or state["sanitizeddescription"]

    # Run the models and fetch a clean dictionary row
    metrics = analysis_module.analyze_single_ticket(text_to_analyze)

    # Construct the update payloads matching your SupportTicketState schema
    sentiment_payload = {
        "label": metrics["final_sentiment"],
        "scores": {
            "NEG": metrics["NEG"],
            "POS": metrics["POS"],
            "NEU": metrics["NEU"]
        }
    }

    toxicity_payload = {
        "toxicity": metrics["toxicity"],
        "severe_toxicity": metrics["severe_toxicity"],
        "obscene": metrics["obscene"],
        "threat": metrics["threat"],
        "insult": metrics["insult"],
        "identity_attack": metrics["identity_attack"]
    }

    # Update both fields simultaneously
    return {
        "sentiment": sentiment_payload,
        "toxicity": toxicity_payload
    }


# =====================================================================
# 4. Create the LangGraph Node Function - Categorization and Urgency Allocation
# =====================================================================

def category_allocation_node(state: SupportTicketState) -> Dict[str, Any]:
    """
    LangGraph node that uses ChatGroq to classify the ticket's category 
    and urgency levels using structured outputs.
    """
    # Use anonymized description for compliance and privacy
    text_to_classify = state.get(
        "anonymizeddescription") or state["rawdescription"]

    # Invoke the LLM module
    classification_result = category_module.allocate_category(text_to_classify)

    # LangGraph checkpoints need JSON-serializable types.
    # Convert Pydantic object to a standard dictionary using .model_dump()
    return {
        "category": classification_result.model_dump()
    }
