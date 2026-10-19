from typing import Annotated
import os
from dotenv import load_dotenv
from huggingface_hub import login
from fastapi import FastAPI, HTTPException, Body
from models.products import Product
from src.agent_modules.pii_detection import PII_Detection_Module
from src.agent_modules.sentiment_toxicanalysis import SentimentToxicAnalysis
from src.agent_modules.category_allocation import CategoryAllocationModule

pii_detection_module = PII_Detection_Module()
sentiment_toxic_analysis = SentimentToxicAnalysis()
category_allocation_module = CategoryAllocationModule()
app = FastAPI()
load_dotenv()

# Optional: Verify it loaded correctly without printing the full secret
print(f"Token loaded: {os.environ.get('HF_TOKEN') is not None}")


@app.get("/")
def read_root():
    return "App is running!."


@app.get("/greet/{name}")
def greet(name: str):
    return {"message": f"Hello, {name}!"}


products = [
    Product(id=1, name="Product 1",
            description="Description of Product 1", quantity=10, price=19.99),
    Product(id=2, name="Product 2",
            description="Description of Product 2", quantity=5, price=29.99),
]


@app.get("/products")
def get_products():
    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):
    product = [p for p in products if p.id == product_id]
    if not product:
        # Better practice: returns a proper HTTP 404 status code
        raise HTTPException(status_code=404, detail="Product not found")
    return product[0]


@app.post("/products")
def create_product(product: Annotated[Product, Body(embed=True)]):
    products.append(product)
    return product


@app.put("/products/{product_id}")
def update_product(product_id: int, updated_product: Product):
    for index, product in enumerate(products):
        if product.id == product_id:
            products[index] = updated_product
            return updated_product
    raise HTTPException(status_code=404, detail="Product not found")


@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    for index, product in enumerate(products):
        if product.id == product_id:
            deleted_product = products.pop(index)
            return {"message": "Product deleted", "product": deleted_product}
    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/classify_input")
def classify_input(user_input: str = Body(..., embed=True)):
    from agent_modules.llm_prompt_injection import PromptInjectionModule

    prompt_injection_module = PromptInjectionModule()
    is_safe = prompt_injection_module.handle_prompt_injection(user_input)

    if is_safe:
        return {"message": "Input is safe."}
    else:
        return {"message": "Prompt injection detected!"}


@app.post("/detect_pii")
def detect_pii(user_input: str = Body(..., embed=True)):
    analyzer_results = pii_detection_module.analyse_input_for_pii(user_input)
    anonymized_text = pii_detection_module.anonymize_input(user_input)

    return {
        "analyzer_results": [result.to_dict() for result in analyzer_results],
        "anonymized_text": anonymized_text
    }


@app.post("/analyze_sentiment_toxicity")
def analyze_sentiment_toxicity(user_input: str = Body(..., embed=True)):
    analysis_results = sentiment_toxic_analysis.analyze_texts([user_input])
    return {
        "analysis_results": analysis_results.to_dict(orient="records")
    }


@app.post("/categorize_text")
def categorize_text(user_input: str = Body(..., embed=True)):
    allocation_result = category_allocation_module.allocate_category(
        user_input)
    return {
        "category": allocation_result
    }
