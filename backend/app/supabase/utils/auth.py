from typing import Union

from fastapi import HTTPException, Request, status
from jose import ExpiredSignatureError, JWTError, jwt
from strawberry.types import Info

from app.supabase.config import supabase_config
from app.graphql.types.jwt_payload import JWTPayload


def get_token(request_or_info: Union[Request, Info]) -> str:
    """
    Extract JWT token from Authorization header.

    Args:
        request_or_info: Either a FastAPI Request or Strawberry Info object

    Returns:
        str: The JWT token

    Raises:
        HTTPException: If authorization header is missing or invalid
    """
    # Handle Strawberry GraphQL Info type
    if isinstance(request_or_info, Info):
        request = request_or_info.context.get("request")
        if not request:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Request context not available"
            )
    else:
        # Handle FastAPI Request type
        request = request_or_info

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    return auth_header.split(" ")[1]


def verify_jwt(request_or_info: Union[Request, Info]) -> JWTPayload:
    """
    Verify a JWT token using the Supabase client.

    Args:
        request_or_info: Either a FastAPI Request or Strawberry Info object

    Returns:
        dict: Payload of the JWT token if valid

    Raises:
        HTTPException: If the token is invalid or expired
    """
    token = get_token(request_or_info)
    if not supabase_config.jwt_secret:
        raise RuntimeError("JWT secret must be set in environment variable: SUPABASE_JWT_SECRET")

    try:
        payload = jwt.decode(
            token, supabase_config.jwt_secret, algorithms=["HS256"], audience="authenticated"
        )
        return JWTPayload(payload)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
