import { Button } from '@cy/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in their child
 * component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <div className="max-w-md text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-foreground">
                            Something went wrong
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            We encountered an unexpected error. Please try
                            refreshing the page or contact support if the
                            problem persists.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 rounded-lg bg-muted p-4 text-left">
                                <p className="font-mono text-xs break-all text-destructive">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </Button>
                            <Button onClick={this.handleReload}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
