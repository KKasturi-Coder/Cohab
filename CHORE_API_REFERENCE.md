# Chore API Reference

This document outlines the GraphQL queries and mutations available for the chore management system.

## Types

### Chore
Represents a chore template that can be assigned to household members.

```graphql
type Chore {
  id: ID!
  household_id: String!
  title: String!
  description: String
  recurrence: String!  # 'daily', 'weekly', 'monthly', 'none'
  points: Int!
  requires_proof: Boolean!
  created_by: String
  created_at: DateTime!
  updated_at: DateTime!
}
```

### ChoreAssignment
Represents a specific assignment of a chore to a user.

```graphql
type ChoreAssignment {
  id: ID!
  chore: Chore!
  user: Profile!
  due_date: DateTime!
  is_complete: Boolean!
  completed_at: DateTime
  proof_url: String
  created_at: DateTime!
}
```

## Queries

All queries are nested under `chores`:

### Get Single Chore
```graphql
query {
  chores {
    chore(choreId: "uuid") {
      id
      title
      description
      recurrence
      points
      requires_proof
    }
  }
}
```

### Get Household Chores
```graphql
query {
  chores {
    householdChores(householdId: "uuid", limit: 50) {
      id
      title
      description
      recurrence
      points
      requires_proof
      created_at
    }
  }
}
```

### Get My Chore Assignments
```graphql
query {
  chores {
    myChoreAssignments(
      householdId: "uuid"
      includeCompleted: false
      limit: 50
    ) {
      id
      chore {
        title
        points
        requires_proof
      }
      user {
        id
        full_name
      }
      due_date
      is_complete
      completed_at
      proof_url
    }
  }
}
```

### Get Household Chore Assignments
```graphql
query {
  chores {
    householdChoreAssignments(
      householdId: "uuid"
      includeCompleted: false
      limit: 50
    ) {
      id
      chore {
        title
        points
      }
      user {
        id
        full_name
      }
      due_date
      is_complete
    }
  }
}
```

## Mutations

All mutations are nested under `chores`:

### Create Chore
```graphql
mutation {
  chores {
    createChore(input: {
      householdId: "uuid"
      title: "Take out trash"
      description: "Take out all trash bins"
      recurrence: "weekly"
      points: 10
      requiresProof: false
    }) {
      id
      title
      points
    }
  }
}
```

### Update Chore
```graphql
mutation {
  chores {
    updateChore(
      choreId: "uuid"
      input: {
        title: "Updated title"
        points: 15
      }
    ) {
      id
      title
      points
      updated_at
    }
  }
}
```

### Delete Chore
```graphql
mutation {
  chores {
    deleteChore(choreId: "uuid")
  }
}
```

### Create Chore Assignment
```graphql
mutation {
  chores {
    createChoreAssignment(input: {
      choreId: "uuid"
      userId: "uuid"
      dueDate: "2024-11-10T12:00:00Z"
    }) {
      id
      chore {
        title
      }
      user {
        full_name
      }
      due_date
    }
  }
}
```

### Complete Chore Assignment
```graphql
mutation {
  chores {
    completeChoreAssignment(input: {
      assignmentId: "uuid"
      proofUrl: "https://example.com/proof.jpg"  # Optional, required if chore requires proof
    }) {
      id
      is_complete
      completed_at
      proof_url
    }
  }
}
```

### Delete Chore Assignment
```graphql
mutation {
  chores {
    deleteChoreAssignment(assignmentId: "uuid")
  }
}
```

## Authorization

- Users must be authenticated for all operations
- Users must be members of the household to:
  - Create, update, or delete chores
  - Create or delete chore assignments
  - View household chores and assignments
- Users can only complete their own chore assignments

## Database Tables

### chores
- `id` (UUID, Primary Key)
- `household_id` (UUID, Foreign Key to households)
- `title` (TEXT)
- `description` (TEXT, nullable)
- `recurrence` (TEXT) - 'daily', 'weekly', 'monthly', 'none'
- `points` (INTEGER)
- `requires_proof` (BOOLEAN)
- `created_by` (UUID, Foreign Key to profiles)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### chore_assignments
- `id` (UUID, Primary Key)
- `chore_id` (UUID, Foreign Key to chores, CASCADE DELETE)
- `user_id` (UUID, Foreign Key to profiles, CASCADE DELETE)
- `due_date` (TIMESTAMPTZ)
- `is_complete` (BOOLEAN)
- `completed_at` (TIMESTAMPTZ, nullable)
- `proof_url` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
