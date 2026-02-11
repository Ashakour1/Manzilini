import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

/**
 * Script to register a tenant directly from provided details
 * Usage: node server/scripts/register-tenant-direct.js
 * 
 * Edit the TENANT_INFO object below with the tenant details
 */

const TENANT_INFO = {
  fullName: 'Khadar Ahmed',
  email: 'khadarahmed7770@gmail.com',
  phone: '0759251861',
  applicationId: 'PR-202602-0002' // Optional: link to property application
};

async function registerTenantDirect() {
  try {
    const { fullName, email, phone, applicationId } = TENANT_INFO;

    console.log(`\n📝 Registering tenant...\n`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone}\n`);

    // Check if tenant already exists by phone
    let tenant = await prisma.tenant.findUnique({
      where: { phone }
    });

    if (tenant) {
      console.log(`⚠️  Tenant with phone "${phone}" already exists (ID: ${tenant.id})`);
      
      // Update tenant info if needed
      const updateData = {};
      if (fullName !== tenant.fullName) {
        updateData.fullName = fullName;
        console.log(`   - Updating name: ${tenant.fullName} → ${fullName}`);
      }
      if (email && email !== tenant.email) {
        // Check if email is already taken by another tenant
        const existingTenantWithEmail = await prisma.tenant.findUnique({
          where: { email }
        });
        
        if (!existingTenantWithEmail) {
          updateData.email = email;
          console.log(`   - Updating email: ${tenant.email || 'N/A'} → ${email}`);
        } else {
          console.log(`   ⚠️  Email "${email}" is already taken by another tenant, skipping email update`);
        }
      }
      updateData.lastActivityAt = new Date();

      if (Object.keys(updateData).length > 0) {
        tenant = await prisma.tenant.update({
          where: { id: tenant.id },
          data: updateData
        });
        console.log(`   ✅ Tenant updated successfully\n`);
      } else {
        console.log(`   ℹ️  No updates needed\n`);
      }
    } else {
      // Create new tenant
      console.log(`📝 Creating new tenant...`);
      
      // Check if email is already taken (if provided)
      if (email) {
        const existingTenantWithEmail = await prisma.tenant.findUnique({
          where: { email }
        });

        if (existingTenantWithEmail) {
          console.error(`❌ Tenant with email "${email}" already exists (ID: ${existingTenantWithEmail.id})`);
          console.log(`   Please use the existing tenant or update the email.`);
          process.exit(1);
        }
      }

      tenant = await generateUniqueIdAndCreate(
        'Tenant',
        async (tx, uniqueId) => {
          const createdTenant = await tx.tenant.create({
            data: {
              id: uniqueId,
              fullName,
              email: email || null,
              phone,
              status: 'NEW',
              lastActivityAt: new Date(),
              applicationsCount: 0
            }
          });

          // Create activity within the same transaction
          await tx.tenantActivity.create({
            data: {
              tenantId: createdTenant.id,
              type: 'STATUS_CHANGED',
              description: 'Tenant created via script'
            }
          });

          return createdTenant;
        }
      );

      console.log(`   ✅ Tenant created successfully (ID: ${tenant.id})\n`);
    }

    // Link to property application if provided
    if (applicationId) {
      console.log(`🔗 Linking to property application: ${applicationId}...`);
      
      const application = await prisma.propertyApplication.findUnique({
        where: { id: applicationId },
        include: {
          property: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!application) {
        console.log(`   ⚠️  Property application "${applicationId}" not found, skipping link\n`);
      } else {
        // Check if already linked
        if (application.tenantId === tenant.id) {
          console.log(`   ℹ️  Application is already linked to this tenant\n`);
        } else {
          await prisma.propertyApplication.update({
            where: { id: applicationId },
            data: { tenantId: tenant.id }
          });

          // Update tenant applications count
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { 
              applicationsCount: { increment: 1 },
              lastActivityAt: new Date()
            }
          });

          // Create tenant activity
          await prisma.tenantActivity.create({
            data: {
              tenantId: tenant.id,
              applicationId: application.id,
              type: 'APPLICATION_SENT',
              description: `Linked application for property: ${application.property.title}`
            }
          });

          console.log(`   ✅ Application linked successfully\n`);
        }
      }
    }

    // Fetch final tenant data with counts
    const finalTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      include: {
        _count: {
          select: {
            applications: true,
            activities: true
          }
        },
        applications: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            property: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    console.log(`\n✅ Registration complete!\n`);
    console.log(`📋 Tenant Summary:`);
    console.log(`   - ID: ${finalTenant.id}`);
    console.log(`   - Name: ${finalTenant.fullName}`);
    console.log(`   - Email: ${finalTenant.email || 'N/A'}`);
    console.log(`   - Phone: ${finalTenant.phone}`);
    console.log(`   - Status: ${finalTenant.status}`);
    console.log(`   - Applications: ${finalTenant._count.applications}`);
    console.log(`   - Activities: ${finalTenant._count.activities}`);
    
    if (finalTenant.applications.length > 0) {
      console.log(`\n   Recent Applications:`);
      finalTenant.applications.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.property.title} (${app.id})`);
      });
    }

    console.log(`\n`);

  } catch (error) {
    console.error(`\n❌ Error registering tenant:`, error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
registerTenantDirect();
