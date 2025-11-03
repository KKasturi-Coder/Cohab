"""Main FastAPI application with GraphQL integration"""
from fastapi import FastAPI, Request
from strawberry.fastapi import GraphQLRouter
from dotenv import load_dotenv
from jose import jwt, JWTError
from app.supabase.utils.client import create_authenticated_client
from app.supabase.config import supabase_config

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

# Context getter for GraphQL
async def get_context(request: Request) -> CustomContext:
    """Get GraphQL context with dependencies"""
    user_id = None
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        # Extract user_id from JWT payload
        if token and supabase_config.jwt_secret:
            try:
                # Verify and decode JWT using Supabase secret
                payload = jwt.decode(
                    token,
                    supabase_config.jwt_secret,
                    algorithms=["HS256"],
                    options={"verify_aud": False}  # Supabase doesn't use aud claim
                )
                user_id = payload.get("sub")  # 'sub' contains the user ID
            except JWTError as e:
                pass  # Invalid token signature or format, user_id remains None
        
        supabase_client = await create_authenticated_client(token)
    except Exception as e:
        raise Exception(f"Failed to create authenticated client: {e}")
    return CustomContext(
        supabase=supabase_client,
        user_id=user_id,
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
