import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


class ChatClient:
    def __init__(self, model_name=None):
        self.model_name = model_name or os.environ.get(
            'GENERAL_MODEL', 'llama-3.3-70b-versatile')
        self.llm = ChatGroq(
            api_key=os.environ.get('GROQ_API_KEY'),
            model=self.model_name,
            temperature=0.0,
            max_retries=2,
            # other params...
        )

    def get_llm(self):
        return self.llm


if __name__ == "__main__":
    # Example usage
    client = ChatClient()
    llm = client.get_llm()
    response = llm.invoke([{"role": "user", "content": "Hello, how are you?"}])
    print(response)
