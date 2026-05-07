import toast, { Toaster } from 'react-hot-toast';

// ============================================
// Toast Notification Utility
// ============================================
// Use for: Brief, non-intrusive feedback that does
// not interrupt the user's workflow.
// Examples: success messages, minor warnings, auto updates.
// Position: Top-right
// ============================================

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#065f46',
        color: '#fff',
        fontWeight: 700,
        fontSize: '13px',
        borderRadius: '12px',
        padding: '14px 20px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#065f46',
      },
    }),

  error: (message: string) =>
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#991b1b',
        color: '#fff',
        fontWeight: 700,
        fontSize: '13px',
        borderRadius: '12px',
        padding: '14px 20px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#991b1b',
      },
    }),

  warning: (message: string) =>
    toast(message, {
      duration: 3500,
      icon: '⚠️',
      style: {
        background: '#92400e',
        color: '#fff',
        fontWeight: 700,
        fontSize: '13px',
        borderRadius: '12px',
        padding: '14px 20px',
      },
    }),

  info: (message: string) =>
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        background: '#1e40af',
        color: '#fff',
        fontWeight: 700,
        fontSize: '13px',
        borderRadius: '12px',
        padding: '14px 20px',
      },
    }),
};

// ToastProvider component — mount once in App.tsx
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          maxWidth: '500px',
        },
      }}
      containerStyle={{
        top: 40,
      }}
    />
  );
}
