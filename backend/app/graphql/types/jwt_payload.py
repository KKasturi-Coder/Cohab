"""
Type definitions for Supabase JWT payloads.

These classes parse a raw JWT dictionary payload into objects,
allowing for dot-notation access (e.g., payload.app_metadata.user_role).
"""

from typing import Any, Dict, Optional


import strawberry


class AppMetadata:
    """
    Parses the 'app_metadata' dictionary from a JWT.

    This data is secure and can only be modified from the backend.
    """

    pass


class UserMetadata:
    """
    Parses the 'user_metadata' dictionary from a JWT.

    This data is secure and can only be modified from the backend.
    """

    pass

class JWTPayload:
    """
    Parses the top-level JWT payload dictionary into an object.
    """

    # --- Standard Claims ---
    sub: Optional[str]
    role: Optional[str]
    aal: Optional[str]
    session_id: Optional[strawberry.ID]
    is_anonymous: Optional[bool]

    # --- Nested Custom Claims ---
    app_metadata: AppMetadata  # This will be an object

    # --- Other Standard Claims (for completeness) ---
    user_metadata: UserMetadata
    email: Optional[str]
    phone: Optional[str]
    aud: Optional[str]
    exp: Optional[int]
    iat: Optional[int]

    def __init__(self, payload: Dict[str, Any]):
        """
        Initializes the object by parsing the raw JWT dictionary.
        """
        # Safely .get() top-level keys
        self.sub = payload.get("sub")
        self.role = payload.get("role")
        self.aal = payload.get("aal")
        self.session_id = payload.get("session_id")
        self.is_anonymous = payload.get("is_anonymous")
        self.user_metadata = UserMetadata(payload.get("user_metadata"))
        self.email = payload.get("email")
        self.phone = payload.get("phone")
        self.aud = payload.get("aud")
        self.exp = payload.get("exp")
        self.iat = payload.get("iat")

        # --- Nested Parsing ---
        # Get the nested app_metadata dictionary (or an empty one)
        # and pass it to the AppMetadata class constructor.
        app_meta_dict = payload.get("app_metadata", {})
        self.app_metadata = AppMetadata(app_meta_dict)

