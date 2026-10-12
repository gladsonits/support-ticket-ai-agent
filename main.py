from fastapi import FastAPI
from models.products import Product

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


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
    product = [product for product in products if product.id == product_id]
    return product[0] if product else {"error": "Product not found"}
