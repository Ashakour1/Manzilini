# Unique ID Generator

This utility generates human-readable, unique IDs for database records in the format: `[TABLE_PREFIX]-[YYYYMM]-[COUNTER]`

## Format

- **TABLE_PREFIX**: First 2 letters of the table name, uppercase (e.g., "User" → "US", "Property" → "PR")
- **YYYYMM**: Year and month reference (e.g., "202601" for January 2026)
- **COUNTER**: Sequential number starting from 0001, with minimum 4-digit padding (grows unlimited: 0001, 0002, ..., 9999, 10000, 10001, etc.)

## Examples

- Users table, January 2026, first record: `US-202601-0001`
- Property table, September 2024, seventh record: `PR-202409-0007`
- FieldAgent table, January 2026, twelfth record: `FI-202601-0012`
- Landlord table, March 2025, third record: `LA-202503-0003`

## Usage

```javascript
import { generateUniqueId } from '../utils/idGenerator.js';

// Generate ID using current date
const userId = await generateUniqueId('User');
// Returns: "US-202601-0001" (for first user in January 2026)

// Generate ID using specific date
const propertyId = await generateUniqueId('Property', new Date('2025-03-15'));
// Returns: "PR-202503-0001" (for first property in March 2025)

// In controller
const uniqueId = await generateUniqueId('Landlord');
const landlord = await prisma.landlord.create({
    data: {
        id: uniqueId,
        name: "John Doe",
        email: "john@example.com",
        // ... other fields
    }
});
```

## Features

1. **Uniqueness**: Guaranteed unique IDs within each table/month combination
2. **Sequential Counter**: Counter increments automatically for each new record per table/month
3. **Monthly Reset**: Counter resets to 0001 each new month automatically
4. **Concurrent Safe**: Uses PostgreSQL Serializable isolation level to handle concurrent inserts
5. **Auto Retry**: Automatically retries on transaction conflicts
6. **Human Readable**: IDs are easy to read and understand at a glance

## Implementation Details

- Uses a separate `IdCounter` table to track sequential counters per table/month
- Uses PostgreSQL transactions with Serializable isolation level for thread safety
- Automatically handles counter creation and incrementation
- Counter key format: `{tableName}_{YYYYMM}` (e.g., "User_202601")

## Database Schema

The system uses an `IdCounter` model to track counters:

```prisma
model IdCounter {
  key        String   @id
  tableName  String
  yearMonth  String
  value      Int      @default(1)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([tableName, yearMonth])
  @@map("id_counters")
}
```

## Table Prefixes

Common table prefixes:
- `User` → `US`
- `Property` → `PR`
- `Landlord` → `LA`
- `FieldAgent` → `FI`
- `PropertyApplication` → `PR`
- `Payment` → `PA`
- `PropertyImages` → `PR`

## Notes

- The counter automatically resets each month (e.g., January 2026 starts at 0001, February 2026 starts at 0001)
- **Unlimited counter**: The counter can grow without limit (0001, 0002, ..., 9999, 10000, 10001, etc.)
- Counter uses minimum 4-digit padding for readability but automatically expands beyond 4 digits when needed
- The system is optimized for high-traffic scenarios with transaction isolation

