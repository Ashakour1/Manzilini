const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeTimeZone = (timeZone) => {
  if (typeof timeZone !== 'string' || !timeZone.trim()) return null;

  try {
    Intl.DateTimeFormat('en-US', { timeZone: timeZone.trim() }).format(new Date());
    return timeZone.trim();
  } catch (_error) {
    return null;
  }
};

const formatDateForEmail = (date, timeZone = null) => {
  if (!date) return 'Not specified';

  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const formatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(normalizedTimeZone ? { timeZone: normalizedTimeZone, timeZoneName: 'short' } : {})
  };

  return new Date(date).toLocaleString('en-US', formatOptions);
};

const formatPriorityForEmail = (priority) => {
  const normalized = typeof priority === 'string' ? priority.toLowerCase().trim() : '';
  if (!normalized) return 'Not specified';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const buildTaskAssignmentEmailTemplate = ({
  assigneeName,
  assignerName,
  taskTitle,
  description,
  priority,
  dueDate,
  dashboardLoginUrl
}) => {
  const safeTaskTitle = escapeHtml(taskTitle || '');
  const safeDescription = description ? escapeHtml(description) : 'No description provided';
  const safeAssigneeName = escapeHtml(assigneeName || 'there');
  const safeAssignerName = escapeHtml(assignerName || 'A team member');
  const safePriority = escapeHtml(formatPriorityForEmail(priority));
  const safeDueDate = escapeHtml(formatDateForEmail(dueDate));
  const safeLoginUrl = escapeHtml(dashboardLoginUrl || '');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .content { padding: 40px 30px; }
          .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 24px; }
          h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; }
          p { font-size: 16px; color: #4a4a4a; margin: 0 0 14px 0; }
          .details { margin: 22px 0; padding: 18px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fafafa; }
          .details p { margin: 8px 0; font-size: 15px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff !important; text-decoration: none; border-radius: 4px; margin: 12px 0 18px 0; font-weight: 500; }
          .footer { margin-top: 36px; padding-top: 22px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">Manzilini</div>
            <h1>New Task Assigned</h1>
            <p>Hello ${safeAssigneeName},</p>
            <p>${safeAssignerName} assigned a new task to you.</p>

            <div class="details">
              <p><strong>Task:</strong> ${safeTaskTitle}</p>
              <p><strong>Description:</strong> ${safeDescription}</p>
              <p><strong>Priority:</strong> ${safePriority}</p>
              <p><strong>Due Date:</strong> ${safeDueDate}</p>
              <p><strong>Assigned By:</strong> ${safeAssignerName}</p>
            </div>

            <a href="${safeLoginUrl}" class="button">Log in to Dashboard</a>

            <p>Best regards,<br>The Manzilini Team</p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildTaskReminderEmailTemplate = ({
  assigneeName,
  taskTitle,
  description,
  priority,
  dueDate,
  reminderAt,
  timeZone,
  dashboardLoginUrl
}) => {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const safeTaskTitle = escapeHtml(taskTitle || '');
  const safeDescription = description ? escapeHtml(description) : 'No description provided';
  const safeAssigneeName = escapeHtml(assigneeName || 'there');
  const safePriority = escapeHtml(formatPriorityForEmail(priority));
  const safeDueDate = escapeHtml(formatDateForEmail(dueDate, normalizedTimeZone));
  const safeReminderAt = escapeHtml(formatDateForEmail(reminderAt, normalizedTimeZone));
  const safeReminderTimestamp = escapeHtml(reminderAt ? new Date(reminderAt).toISOString() : 'Not specified');
  const safeTimeZone = escapeHtml(normalizedTimeZone || 'Server default');
  const safeLoginUrl = escapeHtml(dashboardLoginUrl || '');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .content { padding: 40px 30px; }
          .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 24px; }
          h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; }
          p { font-size: 16px; color: #4a4a4a; margin: 0 0 14px 0; }
          .details { margin: 22px 0; padding: 18px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fafafa; }
          .details p { margin: 8px 0; font-size: 15px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff !important; text-decoration: none; border-radius: 4px; margin: 12px 0 18px 0; font-weight: 500; }
          .footer { margin-top: 36px; padding-top: 22px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">Manzilini</div>
            <h1>Task Reminder</h1>
            <p>Hello ${safeAssigneeName},</p>
            <p>This is a reminder for your assigned task.</p>

            <div class="details">
              <p><strong>Task:</strong> ${safeTaskTitle}</p>
              <p><strong>Description:</strong> ${safeDescription}</p>
              <p><strong>Priority:</strong> ${safePriority}</p>
              <p><strong>Reminder Time:</strong> ${safeReminderAt}</p>
              <p><strong>Reminder Timestamp:</strong> ${safeReminderTimestamp}</p>
              <p><strong>Time Zone:</strong> ${safeTimeZone}</p>
              <p><strong>Due Date:</strong> ${safeDueDate}</p>
            </div>

            <a href="${safeLoginUrl}" class="button">Open Dashboard</a>

            <p>Best regards,<br>The Manzilini Team</p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
