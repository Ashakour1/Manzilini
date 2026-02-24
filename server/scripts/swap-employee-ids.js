import prisma from '../db/prisma.js';

/**
 * Swap or move employee IDs safely.
 *
 * Usage:
 *   node server/scripts/swap-employee-ids.js <fromId> <toId>
 *
 * Example:
 *   node server/scripts/swap-employee-ids.js EM-202602-0003 EM-202602-0001
 */

const [, , fromIdRaw, toIdRaw] = process.argv;
const fromId = (fromIdRaw || '').trim();
const toId = (toIdRaw || '').trim();

if (!fromId || !toId) {
  console.error('Usage: node server/scripts/swap-employee-ids.js <fromId> <toId>');
  process.exit(1);
}

if (fromId === toId) {
  console.log('No changes required: fromId and toId are the same.');
  process.exit(0);
}

const buildTempId = () => `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function run() {
  try {
    console.log(`\nPreparing to change employee ID: ${fromId} -> ${toId}`);

    const before = await prisma.employee.findMany({
      where: {
        OR: [{ id: fromId }, { id: toId }],
      },
      select: {
        id: true,
        companyId: true,
        name: true,
        email: true,
      },
      orderBy: { id: 'asc' },
    });

    console.log('\nBefore:');
    console.table(before);

    const result = await prisma.$transaction(async (tx) => {
      const source = await tx.employee.findUnique({ where: { id: fromId } });
      if (!source) {
        throw new Error(`Employee not found for source ID: ${fromId}`);
      }

      const target = await tx.employee.findUnique({ where: { id: toId } });

      if (!target) {
        await tx.employee.update({
          where: { id: fromId },
          data: { id: toId },
        });

        return {
          mode: 'move',
          sourceId: fromId,
          targetId: toId,
        };
      }

      const tempId = buildTempId();

      // 1) Move current target out of the way
      await tx.employee.update({
        where: { id: toId },
        data: { id: tempId },
      });

      // 2) Move source to requested target ID
      await tx.employee.update({
        where: { id: fromId },
        data: { id: toId },
      });

      // 3) Complete swap by putting previous target into source ID
      await tx.employee.update({
        where: { id: tempId },
        data: { id: fromId },
      });

      return {
        mode: 'swap',
        sourceId: fromId,
        targetId: toId,
      };
    }, {
      isolationLevel: 'Serializable',
    });

    const after = await prisma.employee.findMany({
      where: {
        OR: [{ id: fromId }, { id: toId }],
      },
      select: {
        id: true,
        companyId: true,
        name: true,
        email: true,
      },
      orderBy: { id: 'asc' },
    });

    console.log(`\nSuccess (${result.mode}).`);
    console.log('\nAfter:');
    console.table(after);
  } catch (error) {
    console.error('\nFailed to change employee IDs.');
    console.error(error?.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
