const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
  
  await resend.emails.send({
    from: 'FitTrack <onboarding@resend.dev>',
    to: 'nfa190506@gmail.com',
    subject: 'Reset your FitTrack password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7a6010;">FitTrack</h2>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #7a6010; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

module.exports = { sendPasswordResetEmail }