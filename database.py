from sqlalchemy import create_engine
from sqlalchemy import sessionmaker

db_url = "postgresql://postgres:admin@localhost:5432/products_db"
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
