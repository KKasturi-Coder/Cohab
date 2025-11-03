"""Main GraphQL schema with domain-specific root fields"""
import strawberry
from .routes.room.schema import RoomsQueries, RoomsMutations
from .routes.profile.schema import ProfilesQueries, ProfilesMutations
from .routes.expense.schema import ExpensesQueries, ExpensesMutations
from .routes.message.schema import MessagesQueries, MessagesMutations
from .routes.notification.schema import NotificationsQueries, NotificationsMutations


@strawberry.type
class Query:
    """Root Query type with nested domain fields"""
    
    @strawberry.field
    def rooms(self) -> RoomsQueries:
        """Room-related queries and mutations"""
        return RoomsQueries()
    
    @strawberry.field
    def profiles(self) -> ProfilesQueries:
        """Profile-related queries and mutations"""
        return ProfilesQueries()
    
    @strawberry.field
    def expenses(self) -> ExpensesQueries:
        """Expense-related queries and mutations"""
        return ExpensesQueries()
    
    @strawberry.field
    def messages(self) -> MessagesQueries:
        """Message-related queries and mutations"""
        return MessagesQueries()
    
    @strawberry.field
    def notifications(self) -> NotificationsQueries:
        """Notification-related queries and mutations"""
        return NotificationsQueries()

@strawberry.type
class Mutation:
    """Root Mutation type with nested domain fields"""
    
    @strawberry.field
    def rooms(self) -> RoomsMutations:
        """Room-related queries and mutations"""
        return RoomsMutations()
    
    @strawberry.field
    def profiles(self) -> ProfilesMutations:
        """Profile-related queries and mutations"""
        return ProfilesMutations()
    
    @strawberry.field
    def expenses(self) -> ExpensesMutations:
        """Expense-related queries and mutations"""
        return ExpensesMutations()
    
    @strawberry.field
    def messages(self) -> MessagesMutations:
        """Message-related queries and mutations"""
        return MessagesMutations()
    
    @strawberry.field
    def notifications(self) -> NotificationsMutations:
        """Notification-related queries and mutations"""
        return NotificationsMutations()

# Create the GraphQL schema
schema = strawberry.Schema(query=Query, mutation=Mutation)
