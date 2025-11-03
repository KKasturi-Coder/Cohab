import inspect
from functools import lru_cache
from typing import Sequence, Type

from ..info import Info
from strawberry.types.nodes import SelectedField


def snake_to_camel(snake_str: str) -> str:
    """Convert snake_case to camelCase."""
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


@lru_cache(maxsize=None)
def get_db_fields_from_class(model_class: Type) -> set[str]:
    """
    Introspects a Strawberry type's Python class to find field names that are
    defined as simple type-annotated attributes, not methods.

    This is the definitive way to separate DB columns from field resolvers.
    """
    # 1. Get all members that are functions/methods (i.e., your custom resolvers)
    resolvers = {
        name for name, member in inspect.getmembers(model_class) if inspect.isfunction(member)
    }

    # 2. Get all fields that have a type annotation in the class body
    #    (e.g., `title: str`). This includes both DB fields and potentially
    #    fields that are also resolvers.
    annotated_fields = set(getattr(model_class, "__annotations__", {}).keys())

    # 3. The database fields are those that are annotated but are NOT resolvers.
    db_fields = annotated_fields - resolvers

    return db_fields


def _extract_fields_from_selections(
    selections: Sequence[SelectedField], camel_to_snake_map: dict[str, str]
) -> tuple[set[str], set[str]]:
    """
    Recursively extract field names from a sequence of GraphQL SelectedField objects.

    Args:
        selections: Sequence of SelectedField objects to parse
        camel_to_snake_map: Mapping from camelCase GraphQL names to snake_case DB names

    Returns:
        Tuple of (db_fields, resolver_fields) - both are sets of field names
    """
    db_fields: set[str] = set()
    resolver_fields: set[str] = set()

    for selection in selections:
        if not isinstance(selection, SelectedField):
            continue

        field_name = selection.name  # This is in camelCase from GraphQL

        # Try to find the DB field (convert GraphQL camelCase to DB snake_case)
        if db_field := camel_to_snake_map.get(field_name):
            db_fields.add(db_field)
        else:
            # It's a resolver field (not in DB)
            resolver_fields.add(field_name)

        # If this field has nested selections, recurse into them
        # (e.g., "items" containing "id", "title")
        if selection.selections:
            nested_db, nested_resolvers = _extract_fields_from_selections(
                selection.selections, camel_to_snake_map
            )
            db_fields.update(nested_db)
            resolver_fields.update(nested_resolvers)

    return db_fields, resolver_fields


def get_requested_db_fields(model_class: Type, info: Info | None = None) -> str:
    """
    Extract requested fields from GraphQL query info and filter to only DB fields.

    Args:
        model_class: The Strawberry type class (e.g., Course, School, Profile)
        info: Optional Strawberry Info object containing the GraphQL query selection set.
              If None, returns "*" (all fields) - useful for dataloaders.

    Returns:
        Comma-separated string of DB field names to select, or "*" if all fields requested
    """
    # If no info provided (e.g., in dataloaders), select all fields
    if not info:
        return "*"

    # Get all possible DB fields for this model (in snake_case)
    all_db_fields = get_db_fields_from_class(model_class)

    # Create mapping from camelCase (GraphQL) to snake_case (DB)
    # Example: 'subjectDepartmentId' → 'subject_department_id'
    camel_to_snake_map = {
        **{snake_to_camel(field): field for field in all_db_fields},  # camelCase → snake_case
        **{field: field for field in all_db_fields},  # snake_case → snake_case
    }

    # Extract requested fields from the GraphQL selection set
    requested_db_fields: set[str] = set()
    requested_resolver_fields: set[str] = set()

    # Parse GraphQL AST field nodes
    if info.selected_fields:
        for selected_field in info.selected_fields:
            if isinstance(selected_field, SelectedField) and selected_field.selections:
                db_fields, resolver_fields = _extract_fields_from_selections(
                    selected_field.selections, camel_to_snake_map
                )
                requested_db_fields.update(db_fields)
                requested_resolver_fields.update(resolver_fields)

    # Always include 'id' if it exists (required for most resolvers)
    if "id" in all_db_fields:
        requested_db_fields.add("id")
        
    # If profile is requested, make sure to include user_id for the relationship
    if "profile" in requested_resolver_fields and "user_id" in all_db_fields:
        requested_db_fields.add("user_id")

    # Auto-include FKs for resolver fields, but ONLY if the FK actually exists
    # This handles belongs-to relationships (e.g., subjectDepartment needs subject_department_id)
    # but safely ignores has-many relationships (e.g., instructorHistory doesn't have instructor_history_id)
    for resolver_field in requested_resolver_fields:
        potential_fk = f"{resolver_field}Id"  # subjectDepartment → subjectDepartmentId
        if fk_field := camel_to_snake_map.get(potential_fk):
            # Only add if this FK field actually exists in the DB
            if fk_field in all_db_fields:
                requested_db_fields.add(fk_field)

    # If no specific fields requested or all DB fields requested, return "*"
    if not requested_db_fields or requested_db_fields == all_db_fields:
        return "*"

    return ",".join(sorted(requested_db_fields))


def get_nested_requested_db_fields(
    info: Info, parent_field_name: str, nested_field_name: str, model_class: Type
) -> str:
    """
    Extract requested DB fields for a nested field in the GraphQL query.
    
    Example: For a query like `liveInstructors { instructor { name, status } }`,
    this extracts the fields requested for `instructor` within `liveInstructors`.
    
    Args:
        info: Strawberry Info object containing the GraphQL query selection set
        parent_field_name: The parent field name (e.g., "liveInstructors")
        nested_field_name: The nested field name (e.g., "instructor")
        model_class: The model class for the nested field (e.g., Instructor)
    
    Returns:
        Comma-separated string of DB field names to select, or "*" if all fields requested
    """
    if not info.selected_fields:
        return "*"
    
    # Get all possible DB fields for this model
    all_db_fields = get_db_fields_from_class(model_class)
    
    # Create mapping from camelCase (GraphQL) to snake_case (DB)
    camel_to_snake_map = {
        **{snake_to_camel(field): field for field in all_db_fields},
        **{field: field for field in all_db_fields},
    }
    
    # Find the parent field in the selection
    for selected_field in info.selected_fields:
        if not isinstance(selected_field, SelectedField):
            continue
            
        # Look through all selections to find the parent field
        for selection in selected_field.selections:
            if isinstance(selection, SelectedField) and selection.name == parent_field_name:
                # Found the parent, now look for the nested field
                for nested_selection in selection.selections:
                    if isinstance(nested_selection, SelectedField) and nested_selection.name == nested_field_name:
                        # Found the nested field, extract its requested fields
                        if nested_selection.selections:
                            requested_db_fields = set()
                            for field_selection in nested_selection.selections:
                                if isinstance(field_selection, SelectedField):
                                    field_name = field_selection.name
                                    if db_field := camel_to_snake_map.get(field_name):
                                        requested_db_fields.add(db_field)
                            
                            # Always include 'id' if it exists
                            if "id" in all_db_fields:
                                requested_db_fields.add("id")
                            
                            if requested_db_fields:
                                return ",".join(sorted(requested_db_fields))
    
    # If we didn't find specific fields, return all
    return "*"


def is_page_info_requested(info: Info) -> bool:
    """
    Check if the client has requested the page_info field in the GraphQL query.

    Args:
        info: Strawberry Info object containing the GraphQL query selection set.

    Returns:
        bool: True if page_info is requested, False otherwise
    """
    if not info.selected_fields:
        return False

    return any(
        isinstance(selection, SelectedField) and selection.name == "pageInfo"
        for selected_field in info.selected_fields
        if isinstance(selected_field, SelectedField) and selected_field.selections
        for selection in selected_field.selections
    )
