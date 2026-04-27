import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again.";
      
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
            if (errorMessage.includes("insufficient permissions")) {
              errorMessage = "You don't have permission to perform this action. Please contact support if you believe this is an error.";
            }
          }
        }
      } catch (e) {
        // Not a JSON error, use default or raw message
        if (this.state.error?.message && !this.state.error.message.includes("{")) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="flex h-full items-center justify-center p-6 bg-background">
          <Card className="w-full max-w-md border-0 shadow-2xl glass">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Unexpected Error</h2>
                <p className="text-sm opacity-60 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button 
                onClick={this.handleReset}
                className="w-full h-12 rounded-2xl gap-2 primary-gradient border-0 text-white font-bold"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
