import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

const STATUS_INPUT_MAP = {
  pending: 'PENDING',
  'in progress': 'IN_PROGRESS',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

const STATUS_OUTPUT_MAP = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const PRIORITY_INPUT_MAP = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
};

const PRIORITY_OUTPUT_MAP = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const serializeMaintenanceRequest = (req) => {
  if (!req) return null;
  return {
    id: req.id,
    propertyId: req.propertyId,
    property: req.property
      ? {
          id: req.property.id,
          title: req.property.title,
          address: req.property.address,
        }
      : null,
    issue: req.issue,
    reportedBy: req.reportedBy,
    reportedDate: req.reportedDate,
    status: STATUS_OUTPUT_MAP[req.status] || req.status,
    statusEnum: req.status,
    priority: PRIORITY_OUTPUT_MAP[req.priority] || req.priority,
    priorityEnum: req.priority,
    assignedTo: req.assignedTo,
    landlordId: req.landlordId,
    tenantId: req.tenantId,
    tenant: req.tenant
      ? { id: req.tenant.id, fullName: req.tenant.fullName }
      : null,
    notes: req.notes,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  };
};

const includeRelations = {
  property: {
    select: {
      id: true,
      title: true,
      address: true,
    },
  },
  landlord: {
    select: {
      id: true,
      name: true,
    },
  },
  tenant: {
    select: {
      id: true,
      fullName: true,
    },
  },
};

// GET /api/v1/maintenance - scoped by authenticated user (not params)
export const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const where = {};

  let landlordIdForProps = null;

  // LANDLORD: only requests for their properties / linked to their landlord record
  if (user.role === 'LANDLORD') {
    const landlord = await prisma.landlord.findUnique({
      where: { email: user.email },
      select: { id: true },
    });
    if (!landlord) {
      return res.status(200).json({ requests: [], properties: [] });
    }
    where.landlordId = landlord.id;
    landlordIdForProps = landlord.id;
  }
  // ADMIN / SUPER_ADMIN: all requests (no extra filter)
  else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const [rawRequests, properties] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      include: includeRelations,
      orderBy: { reportedDate: 'desc' },
    }),
    landlordIdForProps
      ? prisma.property.findMany({
          where: { landlord_id: landlordIdForProps },
          select: { id: true, title: true },
        })
      : prisma.property.findMany({ select: { id: true, title: true } }),
  ]);

  const requests = rawRequests.map(serializeMaintenanceRequest);

  res.status(200).json({ requests, properties });
});

// GET /api/v1/maintenance/:id
export const getMaintenanceRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: includeRelations,
  });

  if (!request) {
    return res.status(404).json({ message: 'Maintenance request not found' });
  }

  res.status(200).json(serializeMaintenanceRequest(request));
});

// POST /api/v1/maintenance - landlordId set from authenticated user (not body)
export const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const {
    propertyId,
    issue,
    reportedBy,
    reportedDate,
    status,
    priority,
    assignedTo,
    tenantId,
    notes,
  } = req.body || {};

  if (!propertyId || !issue || !reportedBy || !reportedDate) {
    return res.status(400).json({
      message: 'propertyId, issue, reportedBy, and reportedDate are required',
    });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    return res.status(400).json({ message: 'Property not found' });
  }

  let landlordId = null;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { email: true, role: true },
  });
  if (user?.role === 'LANDLORD') {
    const landlord = await prisma.landlord.findUnique({
      where: { email: user.email },
      select: { id: true },
    });
    landlordId = landlord?.id ?? null;
  }

  const statusEnum = status ? STATUS_INPUT_MAP[String(status).toLowerCase()] : 'PENDING';
  const priorityEnum = priority ? PRIORITY_INPUT_MAP[String(priority).toLowerCase()] : 'MEDIUM';

  const request = await prisma.maintenanceRequest.create({
    data: {
      propertyId,
      issue: String(issue).trim(),
      reportedBy: String(reportedBy).trim(),
      reportedDate: new Date(reportedDate),
      status: statusEnum || 'PENDING',
      priority: priorityEnum || 'MEDIUM',
      assignedTo: assignedTo ? String(assignedTo).trim() : 'Not Assigned',
      landlordId,
      tenantId: tenantId || null,
      notes: notes ? String(notes).trim() : null,
    },
    include: includeRelations,
  });

  res.status(201).json(serializeMaintenanceRequest(request));
});

// PATCH /api/v1/maintenance/:id
export const updateMaintenanceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    propertyId,
    issue,
    reportedBy,
    reportedDate,
    status,
    priority,
    assignedTo,
    landlordId,
    tenantId,
    notes,
  } = req.body || {};

  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Maintenance request not found' });
  }

  const updateData = {};
  if (propertyId !== undefined) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return res.status(400).json({ message: 'Property not found' });
    }
    updateData.propertyId = propertyId;
  }
  if (issue !== undefined) updateData.issue = String(issue).trim();
  if (reportedBy !== undefined) updateData.reportedBy = String(reportedBy).trim();
  if (reportedDate !== undefined) updateData.reportedDate = new Date(reportedDate);
  if (status !== undefined) {
    const statusEnum = STATUS_INPUT_MAP[String(status).toLowerCase()];
    if (!statusEnum) {
      return res.status(400).json({
        message: 'status must be one of: pending, in_progress, completed',
      });
    }
    updateData.status = statusEnum;
  }
  if (priority !== undefined) {
    const priorityEnum = PRIORITY_INPUT_MAP[String(priority).toLowerCase()];
    if (!priorityEnum) {
      return res.status(400).json({
        message: 'priority must be one of: low, medium, high',
      });
    }
    updateData.priority = priorityEnum;
  }
  if (assignedTo !== undefined) updateData.assignedTo = String(assignedTo).trim();
  if (landlordId !== undefined) updateData.landlordId = landlordId || null;
  if (tenantId !== undefined) updateData.tenantId = tenantId || null;
  if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null;

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
    include: includeRelations,
  });

  res.status(200).json(serializeMaintenanceRequest(updated));
});

// DELETE /api/v1/maintenance/:id
export const deleteMaintenanceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Maintenance request not found' });
  }

  await prisma.maintenanceRequest.delete({
    where: { id },
  });

  res.status(200).json({ message: 'Maintenance request deleted successfully', id });
});
