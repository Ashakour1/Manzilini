import { Resend } from "resend";
import { emailTemplates } from "./email-templates.js";
import prisma from "../db/prisma.js";

const resend = new Resend(process.env.RESEND_API_KEY || "re_J59eVrFe_6XponoSK9mEt6TboiBukDznc");

// Log email to database
const logEmail = async (emailLogData) => {
  try {
    await prisma.emailLog.create({
      data: emailLogData
    });
  } catch (logError) {
    console.error("Failed to log email:", logError);
    // Don't throw - logging failure shouldn't break email sending
  }
};

// Base email sending function
export const sendEmail = async (email, subject, message, emailType = "NOTIFICATION", recipientName = null, landlordId = null, metadata = null) => {
  let emailLogId = null;
  let resendId = null;
  
  try {
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Manzilini <info@noreply.manzilini.com>",
      to: email,
      subject: subject,
      html: message,
    });

    if (error) {
      console.error("Email sending error:", error);
      
      // Log failed email
      await logEmail({
        recipientEmail: email,
        recipientName: recipientName,
        subject: subject,
        message: message,
        emailType: emailType,
        status: "FAILED",
        errorMessage: error.message || JSON.stringify(error),
        landlordId: landlordId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }

    resendId = data?.id || null;
    console.log("Email sent successfully:", data);

    // Log successful email
    await logEmail({
      recipientEmail: email,
      recipientName: recipientName,
      subject: subject,
      message: message,
      emailType: emailType,
      status: "SENT",
      resendId: resendId,
      landlordId: landlordId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    return { data, error: null };
  } catch (error) {
    // If it's not already logged above, log it now
    if (error.message && !error.message.includes("Failed to send email")) {
      await logEmail({
        recipientEmail: email,
        recipientName: recipientName,
        subject: subject,
        message: message,
        emailType: emailType,
        status: "FAILED",
        errorMessage: error.message,
        landlordId: landlordId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
    }
    throw error;
  }
};

// Welcome email for new users
export const sendWelcomeEmail = async (email, userName, landlordId = null) => {
  const message = emailTemplates.welcome(userName);
  return sendEmail(
    email,
    "Welcome to Manzilini! 🎉",
    message,
    "WELCOME",
    userName,
    landlordId,
    { type: "welcome", userName }
  );
};

// Password reset email
export const sendPasswordResetEmail = async (
  email,
  userName,
  resetToken
) => {
  const resetUrl = `${
    process.env.CLIENT_URL || "https://manzilini.com"
  }/reset-password?token=${resetToken}`;
  const message = emailTemplates.passwordReset(userName, resetUrl);
  return sendEmail(
    email,
    "Reset Your Password - Manzilini",
    message,
    "PASSWORD_RESET",
    userName,
    null,
    { type: "password_reset", resetToken }
  );
};

// Email verification with OTP
export const sendVerificationEmail = async (
  email,
  userName,
  otpCode
) => {
  const message = emailTemplates.verification(userName, otpCode);
  return sendEmail(
    email,
    "Verify Your Email - Manzilini",
    message,
    "VERIFICATION",
    userName,
    null,
    { type: "verification", otpCode }
  );
};

// Tenant request notification email
export const sendTenantRequestEmail = async (
  landlordEmail,
  landlordName,
  tenantName,
  propertyTitle,
  propertyAddress,
  propertyCity,
  message,
  applicationId,
  landlordId = null
) => {
  const applicationUrl = `${
    process.env.ADMIN_URL || process.env.CLIENT_URL || "https://panel.manzilini.com"
  }/properties/applications/${applicationId}`;
  const emailMessage = emailTemplates.tenantRequest(
    landlordName,
    tenantName,
    propertyTitle,
    propertyAddress,
    propertyCity,
    message,
    applicationUrl
  );
  return sendEmail(
    landlordEmail,
    `New Application: ${propertyTitle} - Manzilini`,
    emailMessage,
    "TENANT_REQUEST",
    landlordName,
    landlordId,
    { 
      type: "tenant_request",
      tenantName,
      propertyTitle,
      applicationId 
    }
  );
};

// Generic notification email (for custom messages)
export const sendNotificationEmail = async (
  email,
  subject,
  htmlContent,
  recipientName = null,
  landlordId = null,
  metadata = null
) => {
  return sendEmail(
    email,
    subject,
    htmlContent,
    "NOTIFICATION",
    recipientName,
    landlordId,
    metadata
  );
};

// Send landlord approval email with login credentials
export const sendLandlordApprovalEmail = async (
  email,
  userName,
  password = null,
  landlordId = null
) => {
  const loginUrl = process.env.AGENT_PORTAL_URL || "https://panel.manzilini.com/agent-login";
  const emailMessage = emailTemplates.landlordApproval(userName, loginUrl, email, password);
  return sendEmail(
    email,
    "🎉 Your Manzilini Account Has Been Approved!",
    emailMessage,
    "LANDLORD_APPROVAL",
    userName,
    landlordId,
    { 
      type: "landlord_approval",
      loginUrl,
      hasPassword: !!password 
    }
  );
};

// Send landlord inactive notification email
export const sendLandlordInactiveEmail = async (
  email,
  userName,
  inactiveReason = null,
  landlordId = null
) => {
  const emailMessage = emailTemplates.landlordInactive(userName, inactiveReason);
  return sendEmail(
    email,
    "Manzilini Account Status Update",
    emailMessage,
    "LANDLORD_INACTIVE",
    userName,
    landlordId,
    { 
      type: "landlord_inactive",
      inactiveReason 
    }
  );
};

// Send landlord rejection notification email
export const sendLandlordRejectionEmail = async (
  email,
  userName,
  rejectionReason = null,
  landlordId = null
) => {
  const emailMessage = emailTemplates.landlordRejection(userName, rejectionReason);
  return sendEmail(
    email,
    "Manzilini Account Verification Update",
    emailMessage,
    "LANDLORD_REJECTION",
    userName,
    landlordId,
    { 
      type: "landlord_rejection",
      rejectionReason 
    }
  );
};

// Send landlord activation email (when status changes from INACTIVE to ACTIVE)
export const sendLandlordActivationEmail = async (
  email,
  userName,
  landlordId = null
) => {
  const loginUrl = process.env.AGENT_PORTAL_URL || "https://panel.manzilini.com/agent-login";
  const emailMessage = emailTemplates.landlordActivation(userName, loginUrl);
  return sendEmail(
    email,
    "🎉 Your Manzilini Account Has Been Activated!",
    emailMessage,
    "LANDLORD_APPROVAL", // Using approval type for activation
    userName,
    landlordId,
    { 
      type: "landlord_activation",
      loginUrl 
    }
  );
};
