import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

const EMPLOYEE_STATUSES = new Set(['ACTIVE', 'INACTIVE']);

const normalizeEmployeeStatus = (status) => {
  if (typeof status !== 'string') return null;
  const normalized = status.toUpperCase().trim();
  return EMPLOYEE_STATUSES.has(normalized) ? normalized : null;
};

const parseOptionalDate = (value) => {
  if (value === undefined) return { hasValue: false, value: null, error: null };
  if (value === null || String(value).trim() === '') {
    return { hasValue: true, value: null, error: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { hasValue: true, value: null, error: 'hiredAt must be a valid datetime value' };
  }

  return { hasValue: true, value: parsed, error: null };
};

// Get all employees
export const getEmployees = asyncHandler(async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
export const getEmployeeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create employee with generated unique ID
export const createEmployee = asyncHandler(async (req, res) => {
  try {
    const { companyId, name, email, phone, position, department, status, hiredAt } = req.body || {};
    const normalizedCompanyId = companyId ? String(companyId).trim() : '';
    const normalizedName = name ? String(name).trim() : '';
    const normalizedEmail = email ? String(email).trim() : '';

    if (!normalizedCompanyId || !normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: 'Company ID, name, and email are required' });
    }

    const existing = await prisma.employee.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const existingCompanyId = await prisma.employee.findUnique({
      where: { companyId: normalizedCompanyId }
    });

    if (existingCompanyId) {
      return res.status(400).json({ message: 'Employee with this company ID already exists' });
    }

    const statusValue = status ? normalizeEmployeeStatus(status) : 'ACTIVE';
    if (!statusValue) {
      return res.status(400).json({ message: 'status must be ACTIVE or INACTIVE' });
    }

    const parsedHiredAt = parseOptionalDate(hiredAt);
    if (parsedHiredAt.error) {
      return res.status(400).json({ message: parsedHiredAt.error });
    }

    const employee = await generateUniqueIdAndCreate('Employee', async (tx, uniqueId) => {
      return tx.employee.create({
        data: {
          id: uniqueId,
          companyId: normalizedCompanyId,
          name: normalizedName,
          email: normalizedEmail,
          phone: phone ? String(phone).trim() : null,
          position: position ? String(position).trim() : null,
          department: department ? String(department).trim() : null,
          status: statusValue,
          hiredAt: parsedHiredAt.value
        }
      });
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee
export const updateEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, name, email, phone, position, department, status, hiredAt } = req.body || {};

    const existing = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (email && email !== existing.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email: String(email).trim() }
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
    }

    if (companyId !== undefined) {
      const normalizedCompanyId = companyId ? String(companyId).trim() : '';
      if (!normalizedCompanyId) {
        return res.status(400).json({ message: 'companyId cannot be empty' });
      }

      if (normalizedCompanyId !== existing.companyId) {
        const companyIdExists = await prisma.employee.findUnique({
          where: { companyId: normalizedCompanyId }
        });

        if (companyIdExists) {
          return res.status(400).json({ message: 'Employee with this company ID already exists' });
        }
      }
    }

    const data = {};

    if (companyId !== undefined) data.companyId = String(companyId).trim();
    if (name !== undefined) data.name = String(name).trim();
    if (email !== undefined) data.email = String(email).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
    if (position !== undefined) data.position = position ? String(position).trim() : null;
    if (department !== undefined) data.department = department ? String(department).trim() : null;

    if (status !== undefined) {
      const statusValue = normalizeEmployeeStatus(status);
      if (!statusValue) {
        return res.status(400).json({ message: 'status must be ACTIVE or INACTIVE' });
      }
      data.status = statusValue;
    }

    if (hiredAt !== undefined) {
      const parsedHiredAt = parseOptionalDate(hiredAt);
      if (parsedHiredAt.error) {
        return res.status(400).json({ message: parsedHiredAt.error });
      }
      data.hiredAt = parsedHiredAt.value;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data
    });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.employee.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Employee deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
