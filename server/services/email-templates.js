// Email templates for Manzilini - Clean and Simple Design
export const emailTemplates = {
  // Welcome email template
  welcome: (userName) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Welcome</h1>
              <p>Hello ${userName},</p>
              <p>We're thrilled to have you join the Manzilini community! Your journey to finding the perfect property starts here.</p>
              <p>At Manzilini, we're committed to making your property search experience smooth and enjoyable.</p>
              <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
              <p>Welcome aboard!</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; font-size: 15px; }
            .link-box { padding: 15px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; word-break: break-all; }
            .link-box code { font-size: 13px; color: #4a4a4a; font-family: monospace; }
            .notice { padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; background-color: #fafafa; }
            .notice p { margin: 0; font-size: 14px; color: #4a4a4a; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Reset Your Password</h1>
              <p>Hello ${userName},</p>
              <p>We received a request to reset your password for your Manzilini account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: left;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">
                <code>${resetUrl}</code>
              </div>
              <div class="notice">
                <p><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact our support team.</p>
              </div>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .otp-box { padding: 25px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; margin: 25px 0; text-align: center; }
            .otp-code { font-size: 36px; font-weight: 600; color: #1a1a1a; letter-spacing: 8px; font-family: monospace; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Verify Your Email</h1>
              <p>Hello ${userName},</p>
              <p>Thank you for signing up with Manzilini! To complete your registration, please verify your email address.</p>
              <p>Your verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
              </div>
              <p>Enter this code in the verification page to activate your account.</p>
              <p>This code will expire in 10 minutes.</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            h3 { font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 10px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; font-size: 15px; }
            .info-box { padding: 20px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; }
            .info-box p { margin: 8px 0; font-size: 15px; }
            .message-box { padding: 15px; background-color: #fafafa; border: 1px solid #e5e5e5; border-left: 3px solid #1a1a1a; border-radius: 4px; margin: 20px 0; font-style: italic; }
            .message-box p { margin: 0; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>New Property Application</h1>
              <p>Hello ${landlordName},</p>
              <p>You have received a new application request for your property on Manzilini.</p>
              
              <div class="info-box">
                <h3>${propertyTitle}</h3>
                <p><strong>Location:</strong> ${propertyAddress}, ${propertyCity}</p>
                <p><strong>Applicant:</strong> ${tenantName}</p>
              </div>

              ${message ? `
              <p><strong>Message from ${tenantName}:</strong></p>
              <div class="message-box">
                <p>"${message}"</p>
              </div>
              ` : '<p>The applicant has submitted an application for your property.</p>'}

              <div style="text-align: left; margin: 30px 0;">
                <a href="${applicationUrl}" class="button">Review Application</a>
              </div>

              <p>Please review the application and respond accordingly. You can approve or reject the application from your dashboard.</p>
              
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            h3 { font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; font-size: 15px; }
            .credentials-box { padding: 20px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; margin: 25px 0; }
            .credential-row { margin: 15px 0; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
            .credential-row:last-child { border-bottom: none; }
            .credential-label { font-weight: 600; color: #1a1a1a; margin-bottom: 5px; font-size: 14px; }
            .credential-value { color: #4a4a4a; font-family: monospace; font-size: 14px; word-break: break-all; }
            .info-box { padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; background-color: #fafafa; }
            .info-box p { margin: 0 0 10px 0; font-size: 14px; }
            .info-box ul { margin: 10px 0; padding-left: 20px; }
            .info-box li { margin: 5px 0; font-size: 14px; color: #4a4a4a; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Account Approved</h1>
              <p>Hello ${userName},</p>
              <p>Great news! Your landlord account has been approved and is now active on Manzilini.</p>
              <p>You can now access your field agent portal to manage your properties, landlords, tenants, and track your activities.</p>
              
              <div style="text-align: left; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Access Your Portal</a>
              </div>
              
              <div class="credentials-box">
                <h3>Your Login Credentials</h3>
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
                <p><strong>Important:</strong></p>
                <ul>
                  <li>For security reasons, please change your password after your first login</li>
                  <li>You can manage your properties and track your activities from the dashboard</li>
                  <li>If you have any questions, our support team is here to help</li>
                </ul>
              </div>

              <p>We're excited to have you on board and look forward to working with you!</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .notice-box { padding: 20px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-left: 3px solid #1a1a1a; border-radius: 4px; margin: 25px 0; }
            .notice-box p { margin: 0 0 10px 0; font-size: 15px; }
            .info-box { padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; background-color: #fafafa; }
            .info-box p { margin: 0 0 10px 0; font-size: 14px; }
            .info-box ul { margin: 10px 0; padding-left: 20px; }
            .info-box li { margin: 5px 0; font-size: 14px; color: #4a4a4a; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Account Status Update</h1>
              <p>Hello ${userName},</p>
              <p>We're writing to inform you about a change to your Manzilini landlord account status.</p>
              
              <div class="notice-box">
                <p><strong>Account Status: INACTIVE</strong></p>
                <p>Your landlord account has been set to inactive status on Manzilini.</p>
                ${inactiveReason ? `
                <p style="margin-top: 15px;"><strong>Reason:</strong></p>
                <p>${inactiveReason}</p>
                ` : ''}
              </div>

              <div class="info-box">
                <p><strong>What this means:</strong></p>
                <ul>
                  <li>Your account access has been temporarily restricted</li>
                  <li>Your properties may be hidden from public view</li>
                  <li>You will not receive new tenant applications</li>
                  <li>If you have questions, please contact our support team</li>
                </ul>
              </div>

              <p>If you believe this is an error or would like to discuss reactivating your account, please don't hesitate to reach out to our support team. We're here to help.</p>
              
              <p>Thank you for your understanding.</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .notice-box { padding: 20px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-left: 3px solid #1a1a1a; border-radius: 4px; margin: 25px 0; }
            .notice-box p { margin: 0 0 10px 0; font-size: 15px; }
            .info-box { padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; background-color: #fafafa; }
            .info-box p { margin: 0 0 10px 0; font-size: 14px; }
            .info-box ul { margin: 10px 0; padding-left: 20px; }
            .info-box li { margin: 5px 0; font-size: 14px; color: #4a4a4a; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Account Verification Update</h1>
              <p>Hello ${userName},</p>
              <p>Thank you for your interest in becoming a landlord on Manzilini.</p>
              
              <div class="notice-box">
                <p><strong>Account Status: Not Verified</strong></p>
                <p>After reviewing your registration, we're sorry to inform you that your landlord account verification has been removed.</p>
                ${rejectionReason ? `
                <p style="margin-top: 15px;"><strong>Reason:</strong></p>
                <p>${rejectionReason}</p>
                ` : ''}
              </div>

              <div class="info-box">
                <p><strong>What can you do?</strong></p>
                <ul>
                  <li>If you believe this is an error, please contact our support team</li>
                  <li>You may reapply for verification with updated information</li>
                  <li>Our team is available to answer any questions you may have</li>
                </ul>
              </div>

              <p>If you have any questions or concerns, please don't hesitate to reach out to our support team. We're here to help.</p>
              
              <p>Thank you for your understanding.</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .content { padding: 40px 30px; }
            .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 30px; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 15px 0; }
            p { font-size: 16px; color: #4a4a4a; margin: 0 0 15px 0; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; font-size: 15px; }
            .notice-box { padding: 20px; background-color: #f8f8f8; border: 1px solid #e5e5e5; border-left: 3px solid #1a1a1a; border-radius: 4px; margin: 25px 0; }
            .notice-box p { margin: 0 0 10px 0; font-size: 15px; }
            .info-box { padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px; margin: 20px 0; background-color: #fafafa; }
            .info-box p { margin: 0 0 10px 0; font-size: 14px; }
            .info-box ul { margin: 10px 0; padding-left: 20px; }
            .info-box li { margin: 5px 0; font-size: 14px; color: #4a4a4a; }
            .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Manzilini</div>
              <h1>Account Activated</h1>
              <p>Hello ${userName},</p>
              <p>Great news! Your Manzilini landlord account has been activated and is now active.</p>
              
              <div class="notice-box">
                <p><strong>Account Status: ACTIVE</strong></p>
                <p>Your landlord account has been successfully activated. You can now access all features and manage your properties.</p>
              </div>

              <div class="info-box">
                <p><strong>What you can do now:</strong></p>
                <ul>
                  <li>Manage your properties and listings</li>
                  <li>Receive and review tenant applications</li>
                  <li>Track your property activities</li>
                  <li>Access all landlord features</li>
                </ul>
              </div>

              <div style="text-align: left; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Access Your Portal</a>
              </div>

              <p>If you have any questions or need assistance, our support team is here to help.</p>
              
              <p>Welcome back and thank you for being part of Manzilini!</p>
              <p>Best regards,<br>The Manzilini Team</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};
