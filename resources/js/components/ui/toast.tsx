import * as React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
    {
        variants: {
            variant: {
                default: 'border bg-background text-foreground',
                success:
                    'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
                error:
                    'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
                warning:
                    'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
    id: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    duration?: number;
}

const Toast = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & ToastProps & { onClose?: () => void }
>(({ className, variant, id, title, description, action, onClose, ...props }, ref) => {
    const getIcon = () => {
        switch (variant) {
            case 'success':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
            default:
                return null;
        }
    };

    return (
        <div
            ref={ref}
            className={cn(toastVariants({ variant }), className, 'pointer-events-auto')}
            {...props}
        >
            <div className="flex items-start gap-3">
                {getIcon() && (
                    <div className="flex-shrink-0">{getIcon()}</div>
                )}
                <div className="flex-1">
                    {title && (
                        <div className="text-sm font-semibold">{title}</div>
                    )}
                    {description && (
                        <div className="mt-1 text-sm opacity-90">
                            {description}
                        </div>
                    )}
                </div>
            </div>
            {action}
            <button
                onClick={onClose}
                className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
});
Toast.displayName = 'Toast';

type ToastActionElement = React.ReactElement;

export type ToastType = {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    action?: ToastActionElement;
    duration?: number;
};

type ToastContextType = {
    toasts: ToastType[];
    toast: (props: Omit<ToastType, 'id'>) => string;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    warning: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
    undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastType[]>([]);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = React.useCallback(
        (props: Omit<ToastType, 'id'>) => {
            const id = Math.random().toString(36).substring(2, 9);
            const duration = props.duration ?? 5000;

            setToasts((prev) => [...prev, { ...props, id }]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast],
    );

    const success = React.useCallback(
        (title: string, description?: string) => {
            return toast({ title, description, variant: 'success' });
        },
        [toast],
    );

    const error = React.useCallback(
        (title: string, description?: string) => {
            return toast({ title, description, variant: 'error' });
        },
        [toast],
    );

    const warning = React.useCallback(
        (title: string, description?: string) => {
            return toast({ title, description, variant: 'warning' });
        },
        [toast],
    );

    const info = React.useCallback(
        (title: string, description?: string) => {
            return toast({ title, description, variant: 'info' });
        },
        [toast],
    );

    return (
        <ToastContext.Provider
            value={{
                toasts,
                toast,
                removeToast,
                success,
                error,
                warning,
                info,
            }}
        >
            {children}
            <Toaster />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-3 p-4 md:max-w-[420px]"
            aria-live="polite"
            aria-atomic="true"
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    title={toast.title}
                    description={toast.description}
                    variant={toast.variant}
                    action={toast.action}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

export { Toast, toastVariants };

