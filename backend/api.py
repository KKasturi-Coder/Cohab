"""Main FastAPI application with GraphQL integration"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from dotenv import load_dotenv
from supabase import create_client, Client

from app.graphql.schema import schema
from app.graphql.context import CustomContext

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Cohab API",
    description="GraphQL API for Cohab roommate management app",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)


# Context getter for GraphQL
async def get_context() -> CustomContext:
    """Get GraphQL context with dependencies"""
    # TODO: Extract user_id from authentication token
    # For now, returning context without user_id
    return CustomContext(
        supabase=supabase,
        user_id=None,
    )


# Create GraphQL router
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
)

# Mount GraphQL endpoint
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Cohab API",
        "graphql_endpoint": "/graphql",
        "graphql_playground": "/graphql (visit in browser)",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
