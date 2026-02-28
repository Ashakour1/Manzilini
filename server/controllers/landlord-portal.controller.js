import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';
import bcrypt from 'bcrypt';

async function getLandlordFromUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }
  });

  if (!user) throw { status: 404, message: 'User not found' };
  if (user.role !== 'LANDLORD') throw { status: 403, message: 'Access denied. Landlord role required.' };

  const landlord = await prisma.landlord.findUnique({
    where: { email: user.email },
    select: { id: true, name: true, email: true }
  });

  if (!landlord) throw { status: 404, message: 'Landlord profile not found for this user' };
  return landlord;
}

// ─── PROPERTIES (portal-specific: ownership check, simple create/update/delete) ───

export const getPortalPropertyById = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const property = await prisma.property.findFirst({
      where: { id: req.params.id, landlord_id: landlord.id },
      include: {
        images: true,
        tenants: true,
        staff: true,
        _count: { select: { tenants: true, property_applications: true } }
      }
    });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const createPortalProperty = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const {
      title, property_type, country, city, address, description, status,
      zip_code, price, currency, payment_frequency, deposit_amount, deposit_type,
      bedrooms, bathrooms, garages, size, is_furnished, balcony,
      latitude, longitude, floor, total_floors, amenities, is_published
    } = req.body || {};

    if (!title || !property_type || !country || !city || !address) {
      return res.status(400).json({ message: 'title, property_type, country, city, and address are required' });
    }

    const published = is_published === true || is_published === 'true' || status === 'ACTIVE';

    const property = await generateUniqueIdAndCreate('Property', async (tx, uniqueId) => {
      return await tx.property.create({
        data: {
          id: uniqueId,
          title,
          description: description || '',
          property_type,
          status: status && status !== 'ACTIVE' && status !== 'INACTIVE' ? status : 'FOR_RENT',
          price: price != null && price !== '' ? Number(price) : 0,
          currency: currency || 'KES',
          payment_frequency: payment_frequency || 'MONTHLY',
          deposit_amount: deposit_amount != null && deposit_amount !== '' ? Number(deposit_amount) : null,
          deposit_type: deposit_type || 'FIXED',
          country,
          city,
          address,
          zip_code: zip_code ?? '',
          latitude: latitude != null && latitude !== '' ? Number(latitude) : 0,
          longitude: longitude != null && longitude !== '' ? Number(longitude) : 0,
          bedrooms: bedrooms != null && bedrooms !== '' ? parseInt(bedrooms, 10) : null,
          bathrooms: bathrooms != null && bathrooms !== '' ? parseInt(bathrooms, 10) : null,
          garages: garages != null && garages !== '' ? parseInt(garages, 10) : null,
          size: size != null && size !== '' ? parseFloat(size) : null,
          floor: floor != null && floor !== '' ? parseInt(floor, 10) : null,
          total_floors: total_floors != null && total_floors !== '' ? parseInt(total_floors, 10) : null,
          is_furnished: is_furnished === true || is_furnished === 'true',
          balcony: balcony === true || balcony === 'true',
          amenities: Array.isArray(amenities) ? amenities : [],
          is_published: published,
          landlord_id: landlord.id,
          userId: req.user.id
        },
        include: {
          images: true,
          _count: { select: { tenants: true, property_applications: true } }
        }
      });
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const updatePortalProperty = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, landlord_id: landlord.id }
    });
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    const {
      title, property_type, country, city, address, description, status,
      zip_code, price, currency, payment_frequency, deposit_amount, deposit_type,
      bedrooms, bathrooms, garages, size, is_furnished, balcony,
      latitude, longitude, floor, total_floors, amenities, is_published
    } = req.body || {};
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (property_type !== undefined) updateData.property_type = property_type;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      if (['FOR_RENT', 'FOR_SALE', 'RENTED', 'SOLD'].includes(status)) {
        updateData.status = status;
      } else {
        updateData.is_published = status === 'ACTIVE' || status === true || status === 'true';
      }
    }
    if (is_published !== undefined) updateData.is_published = is_published === true || is_published === 'true';
    if (zip_code !== undefined) updateData.zip_code = zip_code;
    if (price !== undefined && price !== '' && !Number.isNaN(Number(price))) updateData.price = Number(price);
    if (currency !== undefined) updateData.currency = currency;
    if (payment_frequency !== undefined) updateData.payment_frequency = payment_frequency;
    if (deposit_amount !== undefined) updateData.deposit_amount = deposit_amount === '' || deposit_amount == null ? null : Number(deposit_amount);
    if (deposit_type !== undefined) updateData.deposit_type = deposit_type;
    if (latitude !== undefined && latitude !== '') updateData.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== '') updateData.longitude = Number(longitude);
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms === '' || bedrooms == null ? null : parseInt(bedrooms, 10);
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms === '' || bathrooms == null ? null : parseInt(bathrooms, 10);
    if (garages !== undefined) updateData.garages = garages === '' || garages == null ? null : parseInt(garages, 10);
    if (size !== undefined) updateData.size = size === '' || size == null ? null : parseFloat(size);
    if (floor !== undefined) updateData.floor = floor === '' || floor == null ? null : parseInt(floor, 10);
    if (total_floors !== undefined) updateData.total_floors = total_floors === '' || total_floors == null ? null : parseInt(total_floors, 10);
    if (is_furnished !== undefined) updateData.is_furnished = is_furnished === true || is_furnished === 'true';
    if (balcony !== undefined) updateData.balcony = balcony === true || balcony === 'true';
    if (amenities !== undefined) updateData.amenities = Array.isArray(amenities) ? amenities : [];

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        images: true,
        _count: { select: { tenants: true, property_applications: true } }
      }
    });

    res.status(200).json(property);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const deletePortalProperty = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, landlord_id: landlord.id }
    });
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { propertyId: req.params.id } });
      await tx.propertyApplication.deleteMany({ where: { propertyId: req.params.id } });
      await tx.propertyImages.deleteMany({ where: { propertyId: req.params.id } });
      const staffWithProperty = await tx.staff.findMany({
        where: { assignedProperties: { some: { id: req.params.id } } },
        select: { id: true }
      });
      for (const s of staffWithProperty) {
        await tx.staff.update({
          where: { id: s.id },
          data: { assignedProperties: { disconnect: { id: req.params.id } } }
        });
      }
      await tx.tenant.updateMany({ where: { propertyId: req.params.id }, data: { propertyId: null } });
      await tx.property.delete({ where: { id: req.params.id } });
    });

    res.status(200).json({ message: 'Property deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// ─── APPLICATIONS (portal-specific: approve → create tenant, reject) ─────────

export const approveApplication = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const { id } = req.params;
    const { propertyId, rentAmount, leaseStart, leaseEnd } = req.body || {};

    const application = await prisma.propertyApplication.findFirst({
      where: { id, landlordId: landlord.id },
      include: { property: true, tenant: true }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'APPROVED') {
      return res.status(400).json({ message: 'Application is already approved' });
    }

    const assignPropertyId = propertyId || application.propertyId;

    const result = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.propertyApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          isApproved: true,
          statusChangedAt: new Date(),
          statusChangedBy: req.user.id
        }
      });

      let tenant = application.tenant;
      if (tenant) {
        tenant = await tx.tenant.update({
          where: { id: tenant.id },
          data: {
            status: 'ACTIVE',
            propertyId: assignPropertyId,
            rentAmount: rentAmount ? parseFloat(rentAmount) : null,
            leaseStart: leaseStart ? new Date(leaseStart) : null,
            leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
            landlordId: landlord.id,
            lastActivityAt: new Date()
          }
        });
      } else {
        tenant = await generateUniqueIdAndCreate('Tenant', async (innerTx, uniqueId) => {
          return await tx.tenant.create({
            data: {
              id: uniqueId,
              fullName: application.fullName,
              email: application.email || null,
              phone: application.phone,
              status: 'ACTIVE',
              propertyId: assignPropertyId,
              rentAmount: rentAmount ? parseFloat(rentAmount) : null,
              leaseStart: leaseStart ? new Date(leaseStart) : null,
              leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
              landlordId: landlord.id,
              lastActivityAt: new Date(),
              applicationsCount: 1
            }
          });
        });
      }

      if (application.tenantId || tenant) {
        await tx.tenantActivity.create({
          data: {
            tenantId: tenant.id,
            applicationId: id,
            type: 'APPROVED',
            description: `Application approved for property: ${application.property?.title || assignPropertyId}`
          }
        });
      }

      return { application: updatedApp, tenant };
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const rejectApplication = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const { id } = req.params;
    const { remarks } = req.body || {};

    const application = await prisma.propertyApplication.findFirst({
      where: { id, landlordId: landlord.id }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const updated = await prisma.propertyApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        remarks: remarks || null,
        statusChangedAt: new Date(),
        statusChangedBy: req.user.id
      },
      include: {
        property: { select: { id: true, title: true } },
        tenant: true
      }
    });

    if (application.tenantId) {
      await prisma.tenantActivity.create({
        data: {
          tenantId: application.tenantId,
          applicationId: id,
          type: 'REJECTED',
          description: `Application rejected${remarks ? ': ' + remarks : ''}`
        }
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// ─── STAFF ──────────────────────────────────────────────────────────────────

export const getPortalStaff = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const list = await prisma.staff.findMany({
      where: { landlordId: landlord.id },
      include: {
        assignedProperties: { select: { id: true, title: true, city: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    // Map to include single `property` for backwards compatibility (first assigned property)
    const staff = list.map((s) => ({
      ...s,
      property: s.assignedProperties?.[0] ?? null
    }));
    res.status(200).json(staff);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const getPortalStaffById = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const s = await prisma.staff.findFirst({
      where: { id: req.params.id, landlordId: landlord.id },
      include: { assignedProperties: true }
    });
    if (!s) return res.status(404).json({ message: 'Staff not found' });
    const staff = { ...s, property: s.assignedProperties?.[0] ?? null };
    res.status(200).json(staff);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const createPortalStaff = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const { name, firstName, lastName, email, phone, role, assgnmentType, assignedPropertyIds, status } = req.body || {};

    const first = firstName ?? (name ? name.split(/\s+/)[0] : '');
    const last = lastName ?? (name ? name.split(/\s+/).slice(1).join(' ') : '');
    if (!email || !role) {
      return res.status(400).json({ message: 'email and role are required' });
    }
    if (!first.trim()) {
      return res.status(400).json({ message: 'name or firstName is required' });
    }

    const emailExists = await prisma.staff.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ message: 'Staff with this email already exists' });

    const assignmentType = assgnmentType === 'SPECIFIC_PROPERTIES' ? 'SPECIFIC_PROPERTIES' : 'ALL_PROPERTIES';
    const propertyIds = Array.isArray(assignedPropertyIds) ? assignedPropertyIds.filter(Boolean) : [];

    if (assignmentType === 'SPECIFIC_PROPERTIES' && propertyIds.length > 0) {
      const props = await prisma.property.findMany({
        where: { id: { in: propertyIds }, landlord_id: landlord.id }
      });
      if (props.length !== propertyIds.length) {
        return res.status(400).json({ message: 'One or more properties not found or do not belong to you' });
      }
    }

    const staff = await generateUniqueIdAndCreate('Staff', async (tx, uniqueId) => {
      return await tx.staff.create({
        data: {
          id: uniqueId,
          firstName: first,
          lastName: last || first,
          email,
          phone: phone || null,
          role,
          status: status || 'ACTIVE',
          assgnmentType: assignmentType,
          landlordId: landlord.id,
          ...(assignmentType === 'SPECIFIC_PROPERTIES' && propertyIds.length > 0 && {
            assignedProperties: { connect: propertyIds.map((id) => ({ id })) }
          })
        },
        include: {
          assignedProperties: { select: { id: true, title: true } }
        }
      });
    });

    const { password: _, ...staffWithoutPassword } = staff;
    const out = { ...staffWithoutPassword, name: `${staff.firstName} ${staff.lastName}`.trim(), property: staff.assignedProperties?.[0] ?? null, assignedProperties: staff.assignedProperties };
    res.status(201).json(out);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const updatePortalStaff = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const existing = await prisma.staff.findFirst({
      where: { id: req.params.id, landlordId: landlord.id }
    });
    if (!existing) return res.status(404).json({ message: 'Staff not found' });

    const { name, firstName, lastName, email, phone, role, assgnmentType, assignedPropertyIds, status } = req.body || {};
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (name !== undefined) {
      const parts = name.trim().split(/\s+/);
      updateData.firstName = parts[0] || existing.firstName;
      updateData.lastName = parts.slice(1).join(' ') || existing.lastName;
    }
    if (email !== undefined && email !== existing.email) {
      const dup = await prisma.staff.findUnique({ where: { email } });
      if (dup) return res.status(400).json({ message: 'Email already taken' });
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    const newAssignmentType = assgnmentType === 'SPECIFIC_PROPERTIES' ? 'SPECIFIC_PROPERTIES' : (assgnmentType === 'ALL_PROPERTIES' ? 'ALL_PROPERTIES' : undefined);
    if (newAssignmentType !== undefined) {
      updateData.assgnmentType = newAssignmentType;
    }
    const effectiveAssignmentType = newAssignmentType ?? existing.assgnmentType;
    if (assgnmentType !== undefined || assignedPropertyIds !== undefined) {
      if (effectiveAssignmentType === 'ALL_PROPERTIES') {
        updateData.assignedProperties = { set: [] };
      } else {
        const propertyIds = Array.isArray(assignedPropertyIds) ? assignedPropertyIds.filter(Boolean) : [];
        if (propertyIds.length > 0) {
          const props = await prisma.property.findMany({
            where: { id: { in: propertyIds }, landlord_id: landlord.id }
          });
          if (props.length !== propertyIds.length) {
            return res.status(400).json({ message: 'One or more properties not found or do not belong to you' });
          }
        }
        updateData.assignedProperties = { set: propertyIds.map((id) => ({ id })) };
      }
    }

    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignedProperties: { select: { id: true, title: true } }
      }
    });

    const { password: _, ...staffWithoutPassword } = staff;
    const out = { ...staffWithoutPassword, name: `${staff.firstName} ${staff.lastName}`.trim(), property: staff.assignedProperties?.[0] ?? null, assignedProperties: staff.assignedProperties };
    res.status(200).json(out);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export const deletePortalStaff = asyncHandler(async (req, res) => {
  try {
    const landlord = await getLandlordFromUser(req.user.id);
    const existing = await prisma.staff.findFirst({
      where: { id: req.params.id, landlordId: landlord.id }
    });
    if (!existing) return res.status(404).json({ message: 'Staff not found' });

    await prisma.staff.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Staff deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});
