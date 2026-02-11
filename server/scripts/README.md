# Tenant Registration Scripts

Scripts to register tenants from property applications or directly with provided details.

## Scripts

### 1. `register-tenant-from-application.js`

Registers a tenant from an existing property application by application ID.

**Usage:**
```bash
node server/scripts/register-tenant-from-application.js <applicationId>
```

**Example:**
```bash
node server/scripts/register-tenant-from-application.js PR-202602-0002
```

**What it does:**
- Finds the property application by ID
- Extracts tenant information (name, email, phone) from the application
- Creates a new tenant or updates existing tenant if phone number matches
- Links the property application to the tenant
- Updates tenant activity logs

### 2. `register-tenant-direct.js`

Registers a tenant directly with provided details. Edit the `TENANT_INFO` object in the script with the tenant details.

**Usage:**
```bash
node server/scripts/register-tenant-direct.js
```

**To use:**
1. Open `register-tenant-direct.js`
2. Edit the `TENANT_INFO` object at the top:
   ```javascript
   const TENANT_INFO = {
     fullName: 'Khadar Ahmed',
     email: 'khadarahmed7770@gmail.com',
     phone: '0759251861',
     applicationId: 'PR-202602-0002' // Optional
   };
   ```
3. Run the script

**What it does:**
- Creates a new tenant with the provided details
- Updates existing tenant if phone number matches
- Optionally links to a property application if `applicationId` is provided
- Updates tenant activity logs

## Features

Both scripts:
- ✅ Check for existing tenants by phone number (unique constraint)
- ✅ Handle email conflicts gracefully
- ✅ Create tenant activity logs
- ✅ Link property applications to tenants
- ✅ Update tenant application counts
- ✅ Display comprehensive summary after completion

## Notes

- Phone numbers are unique per tenant
- Email addresses are unique per tenant (if provided)
- If a tenant with the same phone exists, the script will update the existing tenant
- If a tenant with the same email exists (but different phone), the script will show an error
- The scripts automatically disconnect from the database when finished
