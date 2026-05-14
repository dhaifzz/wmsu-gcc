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

  installApp: (onInstall: () => void, onDismiss: () => void) =>
    toast(
      (t) => (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span className="font-bold">Install WMSU GCC App</span>
          </div>
          <p className="text-xs font-medium text-red-50">
            Install our app for a better, faster offline experience!
          </p>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => {
                onDismiss();
                toast.dismiss(t.id);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded bg-red-800 text-white hover:bg-red-700 transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {
                onInstall();
                toast.dismiss(t.id);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded bg-white text-red-900 hover:bg-gray-100 transition-colors"
            >
              Install App
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep open until action
        style: {
          background: '#991b1b', // Matching their error red or primary brand theme
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '350px',
        },
      }
    ),
};

// ToastProvider component — mount once in App.tsx
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
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
