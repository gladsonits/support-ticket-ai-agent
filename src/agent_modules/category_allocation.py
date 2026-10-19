from langchain_groq import ChatGroq
import os
from chatservice.chatclient import ChatClient
from agent_schema.PolicyClassificationSchema import PolicyClassificationSchema

# 2. Put your logic, setup variables, and model calling inside a standard Python class


class CategoryAllocationModule:
    def __init__(self):
        # These are now standard class attributes
        self.system_prompt = (
            "You are an expert Policy Support Agent AI. Your task is to analyze incoming "
            "user tickets, queries, or reports, and classify them accurately according to "
            "the provided categories. You must strictly follow the schema provided."
        )
        # self.model_name = "granite3.1-moe"

    def allocate_category(self, user_text: str) -> PolicyClassificationSchema:
        # response = ollama.chat(
        #     model=self.model_name,
        #     messages=[
        #         {"role": "system", "content": self.system_prompt},
        #         {"role": "user", "content": f"classify the following text:\n\n{user_text}"}
        #     ],
        #     # Pass the schema schema here to force the local model to match the JSON structure
        #     format=PolicyClassificationSchema.model_json_schema(),
        #     options={"temperature": 0.0}
        # )

        # Using LangChain Groq for model interaction
        # LLAMA_MODEL = "openai/gpt-oss-120b"

        chat_client = ChatClient(model_name=os.environ.get('GENERAL_MODEL'))
        base_llm = chat_client.get_llm()

        structured_llm = base_llm.with_structured_output(
            PolicyClassificationSchema)

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user",
             "content": f"classify the following text:\n\n{user_text}"}
        ]

        llm_response = structured_llm.invoke(messages)

        return llm_response


# Initialize a single shared instance
category_module = CategoryAllocationModule()

# --- Example Usage ---
if __name__ == "__main__":
    # Initialize your module
    allocator = CategoryAllocationModule()

    sample_ticket = "I need to file a claim because my car bumper was damaged in a parking lot yesterday."

    # Run the classification
    result = allocator.allocate_category(sample_ticket)

    print(f"Category: {result.category}")
    print(f"Urgency:  {result.urgency}")
