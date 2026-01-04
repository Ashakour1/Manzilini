# Setup Instructions for Unique ID Generator

## Steps to Enable Custom ID Generation

After adding the ID generator, you need to complete these steps:

### 1. Generate Prisma Client

The Prisma client needs to be regenerated to include the new `IdCounter` model:

```bash
cd server
npx prisma generate
```

### 2. Push Schema Changes to Database

Create the `id_counters` table in your database:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_id_counter
```

### 3. Verify Setup

After running the commands above, the system should work correctly. The ID generator will:
- Create the `id_counters` table automatically on first use
- Generate IDs in the format: `[PREFIX]-[YYYYMM]-[COUNTER]`
- Examples: `US-202601-0001`, `PR-202601-0001`, `LA-202601-0001`

### 4. Restart Your Server

After generating the Prisma client, restart your server:

```bash
npm run server
# or
npm start
```

## Notes

- The `@default(uuid())` has been removed from models that use custom IDs (User, Property, Landlord, FieldAgent)
- IDs are now generated explicitly using the `generateUniqueId()` function
- The counter resets each month automatically
- No maximum limit - counters can grow to any integer value

## Troubleshooting

If you see errors like:
- `Cannot read properties of undefined (reading 'findUnique')` → Run `npx prisma generate`
- `Table 'id_counters' does not exist` → Run `npx prisma db push`
- `Unknown argument 'user_id'` → This has been fixed by removing the invalid field reference

