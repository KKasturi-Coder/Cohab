# GraphQL Client Structure

This directory contains the organized GraphQL client code. The modular structure makes it easy to maintain and extend as the application grows.

## Directory Structure

```
graphql/
├── config.ts              # API endpoint configuration
├── core.ts                # Core graphqlRequest function
├── types/
│   └── index.ts          # TypeScript type definitions
├── fragments/
│   └── index.ts          # Reusable GraphQL field fragments
├── queries/
│   └── households.ts     # Household query functions
├── mutations/
│   ├── households.ts     # Household mutation functions
│   └── profiles.ts       # Profile mutation functions
└── utils/
    └── helpers.ts        # Helper utility functions
```

## Usage

Import from the main `graphql-client.ts` file, which re-exports everything:

```typescript
import { 
  getMyHouseholds,
  createHousehold,
  updateProfile,
  Household,
  CreateHouseholdInput
} from '@/lib/graphql-client';
```

## Adding New Functionality

### Adding a New Query

1. Create or update the appropriate query file in `queries/`
2. Export the query function
3. Add the export to `graphql-client.ts`

Example (`queries/expenses.ts`):
```typescript
import { graphqlRequest } from '../core';
import { EXPENSE_FIELDS } from '../fragments';
import { Expense } from '../types';

export async function getExpenses(householdId: string): Promise<Expense[]> {
  const result = await graphqlRequest<{ expenses: { list: Expense[] } }>(
    GET_EXPENSES_QUERY,
    { householdId }
  );
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch expenses');
  }
  
  return result.data?.expenses?.list || [];
}
```

### Adding a New Mutation

1. Create or update the appropriate mutation file in `mutations/`
2. Export the mutation function
3. Add the export to `graphql-client.ts`

### Adding New Types

1. Add type definitions to `types/index.ts`
2. Export them as type exports in `graphql-client.ts`

### Adding New Fragments

1. Add fragments to `fragments/index.ts`
2. Use them in your queries and mutations

## Benefits of This Structure

- **Separation of Concerns**: Each domain (households, profiles, expenses) has its own files
- **Easy Navigation**: Find what you need quickly by domain
- **Scalability**: Add new features without cluttering existing code
- **Maintainability**: Isolated changes reduce risk of breaking other features
- **Reusability**: Share fragments and types across queries/mutations
- **Backward Compatibility**: Main export file preserves existing imports
