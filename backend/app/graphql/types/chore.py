import strawberry
from datetime import datetime
from typing import Optional, TYPE_CHECKING, Annotated

if TYPE_CHECKING:
    from .profile import Profile

@strawberry.type
class Chore:
    id: Optional[strawberry.ID]=None
    household_id: Optional[strawberry.ID]=None
    title: Optional[str]=None
    description: Optional[str]=None
    recurrence: Optional[str]=None
    points: Optional[int]=None
    requires_proof: Optional[bool]=None
    created_by: Optional[strawberry.ID]=None
    created_at: Optional[datetime]=None
    updated_at: Optional[datetime]=None

@strawberry.type
class ChoreAssignment:
    id: Optional[strawberry.ID]=None
    chore: Optional[Chore]=None
    user: Optional[Annotated["Profile", strawberry.lazy("app.graphql.types.profile")]]=None
    due_date: Optional[datetime]=None
    is_complete: Optional[bool]=None
    completed_at: Optional[datetime]=None
    proof_url: Optional[str]=None
    created_at: Optional[datetime]=None