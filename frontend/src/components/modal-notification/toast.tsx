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
  success: (message: string, options?: any) =>
    toast.success(message, {
      duration: options?.duration || 3000,
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

  error: (message: string, options?: any) =>
    toast.error(message, {
      duration: options?.duration || 4000,
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

  warning: (message: string, options?: any) =>
    toast(message, {
      duration: options?.duration || 3500,
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

  info: (message: string, options?: any) =>
    toast(message, {
      duration: options?.duration || 3000,
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
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
        duration: 5000, // Show for 5 seconds
        position: 'top-right',
        style: {
          background: '#991b1b', // Matching their error red or primary brand theme
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '350px',
        },
      }
    ),
  
  dismiss: (id?: string) => toast.dismiss(id),
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
