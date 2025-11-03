"""Get household chore assignments query resolver"""
import strawberry
from typing import List
from ....types import ChoreAssignment, Chore, Profile
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def household_chore_assignments(
    info: Info,
    household_id: str,
    include_completed: bool = False,
    limit: int = 50
) -> List[ChoreAssignment]:
    """Get all chore assignments for a household"""
    context = info.context
    
    # First get all chores in the household
    chores_result = await context.supabase.table("chores") \
        .select("*") \
        .eq("household_id", household_id) \
        .execute()
    
    if not chores_result.data:
        return []
        
    chore_ids = [chore['id'] for chore in chores_result.data]
    
    # First get all users in the household
    roommates_result = await context.supabase.table("roommates") \
        .select("user_id") \
        .eq("household_id", household_id) \
        .execute()
    
    if not roommates_result.data:
        return []
        
    user_ids = [r['user_id'] for r in roommates_result.data]
    
    # Get user profiles
    profiles_result = await context.supabase.table("profiles") \
        .select("*") \
        .in_("id", user_ids) \
        .execute()
    
    profiles_map = {p['id']: p for p in profiles_result.data}
    
    # Then get assignments for these chores
    query = context.supabase.table("chore_assignments").select(
        "*, chores:chore_id(*)"
    ).in_("chore_id", chore_ids)
    
    if not include_completed:
        query = query.eq("is_complete", False)
    
    result = await query.order("due_date", desc=False).limit(limit).execute()
    
    assignments = []
    for assignment in result.data:
        # Skip if chore data is missing
        if not assignment.get("chores"):
            print(f"[WARN] Skipping assignment {assignment.get('id')} - missing chore data")
            continue
            
        try:
            chore_data = parse_datetime_fields(assignment["chores"], "created_at", "updated_at")
            user_id = assignment.get("user_id")
            
            # Get user profile from our pre-fetched profiles
            user_data = profiles_map.get(user_id)
            if not user_data:
                print(f"[WARN] Skipping assignment {assignment.get('id')} - user {user_id} not found in household")
                continue
                
            user_data = parse_datetime_fields(user_data, "created_at", "updated_at")
            assignment_data = parse_datetime_fields(assignment, "due_date", "completed_at", "created_at")
            
            # Skip if required fields are missing
            required_chore_fields = ["id", "title", "household_id"]
            
            if not all(key in chore_data for key in required_chore_fields):
                missing = [f for f in required_chore_fields if f not in chore_data]
                print(f"[WARN] Skipping assignment {assignment.get('id')} - missing required chore fields: {missing}")
                continue
            
            assignments.append(ChoreAssignment(
                id=assignment_data["id"],
                chore=Chore(**chore_data),
                user=Profile(**user_data),
                due_date=assignment_data["due_date"],
                is_complete=assignment_data["is_complete"],
                completed_at=assignment_data.get("completed_at"),
                proof_url=assignment_data.get("proof_url"),
                created_at=assignment_data["created_at"]
            ))
        except Exception as e:
            print(f"[ERROR] Error processing assignment {assignment.get('id')}: {str(e)}")
            continue
    
    return assignments
