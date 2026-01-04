import prisma from '../db/prisma.js';

/**
 * Generates a unique ID and increments the counter within a transaction
 * This ensures the counter only increments on successful record creation
 * 
 * @param {string} tableName - Name of the table (e.g., "User", "Property")
 * @param {Date} date - Reference date for YYYYMM (defaults to current date)
 * @param {Function} createFn - Function that creates the record, receives (tx, uniqueId)
 * @returns {Promise<any>} The created record
 */
export async function generateUniqueIdAndCreate(tableName, createFn, date = new Date()) {
  // Get table prefix (first 2 letters, uppercase)
  const prefix = tableName.substring(0, 2).toUpperCase();
  
  // Get year and month (YYYYMM)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}${month}`;
  
  // Create a key for this table/month combination
  const counterKey = `${tableName}_${yearMonth}`;
  
  try {
    // Use a transaction to ensure counter increment and record creation are atomic
    return await prisma.$transaction(async (tx) => {
      // Try to find existing counter
      let counterRecord = await tx.idCounter.findUnique({
        where: { key: counterKey }
      });
      
      if (counterRecord) {
        // Increment existing counter
        counterRecord = await tx.idCounter.update({
          where: { key: counterKey },
          data: { 
            value: { increment: 1 },
            updatedAt: new Date()
          }
        });
      } else {
        // Create new counter starting at 1
        counterRecord = await tx.idCounter.create({
          data: {
            key: counterKey,
            tableName: tableName,
            yearMonth: yearMonth,
            value: 1
          }
        });
      }
      
      // Format the counter (no padding limit - allows unlimited growth)
      // Use minimum 4-digit padding for readability, but allow growth beyond
      const counterPadded = String(counterRecord.value).padStart(4, '0');
      
      // Generate the unique ID
      const uniqueId = `${prefix}-${yearMonth}-${counterPadded}`;
      
      // Create the record using the transaction context and unique ID
      // If this fails, the entire transaction (including counter increment) rolls back
      return await createFn(tx, uniqueId);
      
    }, {
      isolationLevel: 'Serializable', // Highest isolation level for concurrent safety
      timeout: 10000
    });
    
  } catch (error) {
    // If transaction fails, everything rolls back (counter increment + record creation)
    console.error(`Error in generateUniqueIdAndCreate for ${tableName}:`, error);
    throw error;
  }
}

/**
 * Generates a unique ID in the format: [TABLE_PREFIX]-[YYYYMM]-[COUNTER]
 * NOTE: This increments the counter immediately. Use generateUniqueIdAndCreate for atomic operations.
 * 
 * @param {string} tableName - Name of the table (e.g., "User", "Property")
 * @param {Date} date - Reference date for YYYYMM (defaults to current date)
 * @returns {Promise<string>} Generated unique ID (e.g., "US-202601-0001")
 * @deprecated Use generateUniqueIdAndCreate instead to avoid counter increments on errors
 */
export async function generateUniqueId(tableName, date = new Date()) {
  // Get table prefix (first 2 letters, uppercase)
  const prefix = tableName.substring(0, 2).toUpperCase();
  
  // Get year and month (YYYYMM)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}${month}`;
  
  // Create a key for this table/month combination
  const counterKey = `${tableName}_${yearMonth}`;
  
  try {
    // Use a transaction to ensure atomicity
    const counter = await prisma.$transaction(async (tx) => {
      // Try to find existing counter
      let counterRecord = await tx.idCounter.findUnique({
        where: { key: counterKey }
      });
      
      if (counterRecord) {
        // Increment existing counter
        counterRecord = await tx.idCounter.update({
          where: { key: counterKey },
          data: { 
            value: { increment: 1 },
            updatedAt: new Date()
          }
        });
      } else {
        // Create new counter starting at 1
        counterRecord = await tx.idCounter.create({
          data: {
            key: counterKey,
            tableName: tableName,
            yearMonth: yearMonth,
            value: 1
          }
        });
      }
      
      return counterRecord.value;
    }, {
      isolationLevel: 'Serializable', // Highest isolation level for concurrent safety
      timeout: 5000
    });
    
    // Format the counter (no padding limit - allows unlimited growth)
    // Use minimum 4-digit padding for readability, but allow growth beyond
    const counterPadded = String(counter).padStart(4, '0');
    
    // Return formatted ID: PREFIX-YYYYMM-COUNTER
    return `${prefix}-${yearMonth}-${counterPadded}`;
    
  } catch (error) {
    // If transaction fails (e.g., due to concurrent access), retry once
    if (error.code === 'P2034' || error.message.includes('Serializable')) {
      console.warn(`Retrying ID generation for ${counterKey} due to concurrent access`);
      return generateUniqueId(tableName, date);
    }
    
    console.error('Error generating unique ID:', error);
    throw new Error(`Failed to generate unique ID for table ${tableName}: ${error.message}`);
  }
}

/**
 * Gets the table prefix from a table name
 * @param {string} tableName - Name of the table
 * @returns {string} Two-letter uppercase prefix
 */
export function getTablePrefix(tableName) {
  return tableName.substring(0, 2).toUpperCase();
}

/**
 * Formats a date to YYYYMM format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (YYYYMM)
 */
export function formatYearMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}
