// Email templates for Manzilini
export const emailTemplates = {
  // Welcome email template
  welcome: (userName) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #2a6f97; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2a6f97; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
            .button:hover { background-color: #3a7fa7; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
            .brand-text { color: #2a6f97; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Welcome! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We're thrilled to have you join the Manzilini community! Your journey to finding the perfect property starts here.</p>
              <p>At Manzilini, we're committed to making your property search experience smooth and enjoyable.</p>
              <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
              <p>Welcome aboard!</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Password reset email template
  passwordReset: (userName, resetUrl) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #2a6f97; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2a6f97; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
            .button:hover { background-color: #3a7fa7; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
            .brand-text { color: #2a6f97; font-weight: 600; }
            .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We received a request to reset your password for your Manzilini account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2a6f97;">${resetUrl}</p>
              <div class="warning">
                <p><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact our support team.</p>
              </div>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Email verification template
  verification: (userName, otpCode) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #2a6f97; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background-color: #f9fafb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; border: 2px solid #2a6f97; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2a6f97; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for signing up with Manzilini! To complete your registration, please verify your email address.</p>
              <p>Your verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
              </div>
              <p>Enter this code in the verification page to activate your account.</p>
              <p>This code will expire in 10 minutes.</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Tenant request notification template
  tenantRequest: (landlordName, tenantName, propertyTitle, propertyAddress, propertyCity, message, applicationUrl) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #2a6f97; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2a6f97; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
            .button:hover { background-color: #3a7fa7; }
            .property-info { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2a6f97; }
            .property-title { font-size: 20px; font-weight: bold; color: #2a6f97; margin-bottom: 10px; }
            .message-box { background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e5e7eb; font-style: italic; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">New Property Application 📋</h1>
            </div>
            <div class="content">
              <h2>Hello ${landlordName},</h2>
              <p>You have received a new application request for your property on Manzilini.</p>
              
              <div class="property-info">
                <div class="property-title">${propertyTitle}</div>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${propertyAddress}, ${propertyCity}</p>
                <p style="margin: 5px 0;"><strong>Applicant:</strong> ${tenantName}</p>
              </div>

              ${message ? `
              <p><strong>Message from ${tenantName}:</strong></p>
              <div class="message-box">
                "${message}"
              </div>
              ` : '<p>The applicant has submitted an application for your property.</p>'}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${applicationUrl}" class="button">Review Application</a>
              </div>

              <p>Please review the application and respond accordingly. You can approve or reject the application from your dashboard.</p>
              
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Landlord approval email template
  landlordApproval: (userName, loginUrl, email, password) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background: linear-gradient(135deg, #2a6f97 0%, #3a7fa7 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 35px; background-color: #2a6f97; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
            .button:hover { background-color: #3a7fa7; }
            .credentials-box { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2a6f97; }
            .credential-row { margin: 12px 0; padding: 10px; background-color: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb; }
            .credential-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
            .credential-value { color: #1f2937; font-family: 'Courier New', monospace; font-size: 14px; }
            .info-box { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2a6f97; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">🎉 Account Approved!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Great news! Your landlord account has been approved and is now active on Manzilini.</p>
              <p>You can now access your field agent portal to manage your properties, landlords, tenants, and track your activities.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Access Your Portal</a>
              </div>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #2a6f97;">Your Login Credentials</h3>
                <div class="credential-row">
                  <div class="credential-label">Login URL:</div>
                  <div class="credential-value">${loginUrl}</div>
                </div>
                <div class="credential-row">
                  <div class="credential-label">Email:</div>
                  <div class="credential-value">${email}</div>
                </div>
                ${password ? `
                <div class="credential-row">
                  <div class="credential-label">Password:</div>
                  <div class="credential-value">${password}</div>
                </div>
                ` : ''}
              </div>

              <div class="info-box">
                <p><strong>💡 Important:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>For security reasons, please change your password after your first login</li>
                  <li>You can manage your properties and track your activities from the dashboard</li>
                  <li>If you have any questions, our support team is here to help</li>
                </ul>
              </div>

              <p>We're excited to have you on board and look forward to working with you!</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Landlord inactive notification template
  landlordInactive: (userName, inactiveReason) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .info-box { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2a6f97; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Account Status Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We're writing to inform you about a change to your Manzilini landlord account status.</p>
              
              <div class="warning-box">
                <p><strong>Account Status: INACTIVE</strong></p>
                <p>Your landlord account has been set to inactive status on Manzilini.</p>
                ${inactiveReason ? `
                <p style="margin-top: 15px;"><strong>Reason:</strong></p>
                <p>${inactiveReason}</p>
                ` : ''}
              </div>

              <div class="info-box">
                <p><strong>💡 What this means:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Your account access has been temporarily restricted</li>
                  <li>Your properties may be hidden from public view</li>
                  <li>You will not receive new tenant applications</li>
                  <li>If you have questions, please contact our support team</li>
                </ul>
              </div>

              <p>If you believe this is an error or would like to discuss reactivating your account, please don't hesitate to reach out to our support team. We're here to help.</p>
              
              <p>Thank you for your understanding.</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Landlord rejection notification template
  landlordRejection: (userName, rejectionReason) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background-color: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .info-box { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2a6f97; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Account Verification Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for your interest in becoming a landlord on Manzilini.</p>
              
              <div class="warning-box">
                <p><strong>Account Status: Not Verified</strong></p>
                <p>After reviewing your registration, we're sorry to inform you that your landlord account verification has been removed.</p>
                ${rejectionReason ? `
                <p style="margin-top: 15px;"><strong>Reason:</strong></p>
                <p>${rejectionReason}</p>
                ` : ''}
              </div>

              <div class="info-box">
                <p><strong>💡 What can you do?</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>If you believe this is an error, please contact our support team</li>
                  <li>You may reapply for verification with updated information</li>
                  <li>Our team is available to answer any questions you may have</li>
                </ul>
              </div>

              <p>If you have any questions or concerns, please don't hesitate to reach out to our support team. We're here to help.</p>
              
              <p>Thank you for your understanding.</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Landlord activation email template (when status changes from INACTIVE to ACTIVE)
  landlordActivation: (userName, loginUrl) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #e5e7eb; }
            .container { max-width: 600px; margin: 20px auto; padding: 0; }
            .header { background: linear-gradient(135deg, #2a6f97 0%, #3a7fa7 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 35px; background-color: #2a6f97; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
            .button:hover { background-color: #3a7fa7; }
            .success-box { background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .info-box { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2a6f97; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Manzilini</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Account Activated! ✅</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Great news! Your Manzilini landlord account has been activated and is now active.</p>
              
              <div class="success-box">
                <p><strong>Account Status: ACTIVE</strong></p>
                <p>Your landlord account has been successfully activated. You can now access all features and manage your properties.</p>
              </div>

              <div class="info-box">
                <p><strong>🎉 What you can do now:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Manage your properties and listings</li>
                  <li>Receive and review tenant applications</li>
                  <li>Track your property activities</li>
                  <li>Access all landlord features</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Access Your Portal</a>
              </div>

              <p>If you have any questions or need assistance, our support team is here to help.</p>
              
              <p>Welcome back and thank you for being part of Manzilini!</p>
              <p>Best regards,<br>The Manzilini Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};
