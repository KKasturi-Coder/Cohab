"""Custom GraphQL Info type"""
from .context import CustomContext
from strawberry.types import Info as CustomInfo

Info = CustomInfo[CustomContext, None]
