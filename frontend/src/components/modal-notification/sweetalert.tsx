import Swal from 'sweetalert2';

// ============================================
// SweetAlert2 Notification Utility
// ============================================
// Use for: Important messages, warnings, confirmations,
// or user inputs that require interaction.
// Examples: email confirmation, delete confirmation,
// registration success, critical errors.
// ============================================

// Custom theme matching GCC emerald branding
const gccTheme = {
  confirmButtonColor: '#064e3b',   // emerald-900
  cancelButtonColor: '#6b7280',    // gray-500
  denyButtonColor: '#dc2626',      // red-600
  background: '#ffffff',
  color: '#1e293b',                // slate-800
};

export const showAlert = {
  // Success alert (e.g., registration complete, action successful)
  success: (title: string, text?: string) =>
    Swal.fire({
      icon: 'success',
      title,
      text,
      ...gccTheme,
      confirmButtonText: 'OK',
      timer: undefined,
    }),

  // Error alert (e.g., critical failures, server errors)
  error: (title: string, text?: string) =>
    Swal.fire({
      icon: 'error',
      title,
      text,
      ...gccTheme,
      confirmButtonText: 'OK',
    }),

  // Warning alert (e.g., unsaved changes, important notices)
  warning: (title: string, text?: string) =>
    Swal.fire({
      icon: 'warning',
      title,
      text,
      ...gccTheme,
      confirmButtonText: 'OK',
    }),

  // Info alert (e.g., helpful instructions)
  info: (title: string, text?: string) =>
    Swal.fire({
      icon: 'info',
      title,
      text,
      ...gccTheme,
      confirmButtonText: 'Got it',
    }),

  // Confirmation dialog (e.g., "Are you sure?")
  confirm: (title: string, text?: string, confirmText = 'Yes', cancelText = 'Cancel') =>
    Swal.fire({
      icon: 'question',
      title,
      text,
      ...gccTheme,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    }),

  // Email confirmation success — used after registration
  emailConfirmation: (email: string) =>
    Swal.fire({
      icon: 'success',
      title: 'Check your email!',
      html: `
        <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">
          We've sent a confirmation link to:
        </p>
        <p style="color: #047857; font-weight: 800; font-size: 15px; margin-bottom: 16px;">
          ${email}
        </p>
        <p style="color: #94a3b8; font-size: 12px;">
          Please click the link in the email to verify your account before signing in.
        </p>
      `,
      ...gccTheme,
      confirmButtonText: 'Go to Sign in',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }),
};
