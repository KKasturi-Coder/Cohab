"""Main GraphQL schema with domain-specific root fields"""
import strawberry
from .routes.households import HouseholdQueries, HouseholdMutations
from .routes.profile import ProfileQueries, ProfileMutations
from .routes.expense import ExpenseQueries, ExpenseMutations
from .routes.message import MessageQueries, MessageMutations
from .routes.notification import NotificationQueries, NotificationMutations
from .routes.chore import ChoreQueries, ChoreMutations


@strawberry.type
class Query:
    """Root Query type with nested domain fields"""
    
    @strawberry.field
    def households(self) -> HouseholdQueries:
        """Room-related queries and mutations"""
        return HouseholdQueries()
    
    @strawberry.field
    def profiles(self) -> ProfileQueries:
        """Profile-related queries and mutations"""
        return ProfileQueries()
    
    @strawberry.field
    def expenses(self) -> ExpenseQueries:
        """Expense-related queries and mutations"""
        return ExpenseQueries()
    
    @strawberry.field
    def messages(self) -> MessageQueries:
        """Message-related queries and mutations"""
        return MessageQueries()
    
    @strawberry.field
    def notifications(self) -> NotificationQueries:
        """Notification-related queries and mutations"""
        return NotificationQueries()
    
    @strawberry.field
    def chores(self) -> ChoreQueries:
        """Chore-related queries and mutations"""
        return ChoreQueries()

@strawberry.type
class Mutation:
    """Root Mutation type with nested domain fields"""
    
    @strawberry.field
    def households(self) -> HouseholdMutations:
        """Room-related queries and mutations"""
        return HouseholdMutations()
    
    @strawberry.field
    def profiles(self) -> ProfileMutations:
        """Profile-related queries and mutations"""
        return ProfileMutations()
    
    @strawberry.field
    def expenses(self) -> ExpenseMutations:
        """Expense-related queries and mutations"""
        return ExpenseMutations()
    
    @strawberry.field
    def messages(self) -> MessageMutations:
        """Message-related queries and mutations"""
        return MessageMutations()
    
    @strawberry.field
    def notifications(self) -> NotificationMutations:
        """Notification-related queries and mutations"""
        return NotificationMutations()
    
    @strawberry.field
    def chores(self) -> ChoreMutations:
        """Chore-related queries and mutations"""
        return ChoreMutations()

# Create the GraphQL schema
schema = strawberry.Schema(query=Query, mutation=Mutation)
