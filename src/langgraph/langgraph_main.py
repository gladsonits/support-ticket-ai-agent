from langgraph.graph import StateGraph, START, END
from src.langgraph.supportticket_state import SupportTicketState
from langgraph.langgraph_nodes import (
    prompt_injection_check_node,
    pii_scrubber_node,
    sentiment_analytics_node,
    category_allocation_node
)


class LangGraphWorkflow:
    def __init__(self):
        # 1. Instantiate the master workflow
        self.workflow = StateGraph(SupportTicketState)

        # 2. Wire up all processing nodes
        self.workflow.add_node("scrub_pii", pii_scrubber_node)
        self.workflow.add_node("check_injection", prompt_injection_check_node)
        self.workflow.add_node("run_analytics", sentiment_analytics_node)
        self.workflow.add_node("allocate_category", category_allocation_node)

        # 3. Stitch together the edge graph flow
        self.workflow.add_edge(START, "scrub_pii")
        self.workflow.add_edge("scrub_pii", "check_injection")
        self.workflow.add_conditional_edges(
            "check_injection",
            self.route_after_security_check,
            {END: END, "run_analytics": "run_analytics"}
        )
        self.workflow.add_edge("run_analytics", "allocate_category")
        self.workflow.add_edge("allocate_category", END)

    def route_after_security_check(self, state: SupportTicketState) -> str:
        security_data = state.get("promptinjection")
        if security_data and not security_data.get("is_safe", True):
            return END
        return "run_analytics"

    def compile_workflow(self):
        # 4. Compile the application
        return self.workflow.compile()


langgraph_workflow = LangGraphWorkflow()
