import React, { Component } from "react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo
  ) {
    console.error(
      "Error caught by boundary:",
      error,
      errorInfo
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Ops! Algo deu errado
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                Ocorreu um erro inesperado na aplicação.
              </AlertDialogDescription>
              {this.state.error && (
                <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded mt-2 dark:bg-slate-900 dark:text-slate-200">
                  {this.state.error.message}
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={this.handleReset}>
                Voltar ao início
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return this.props.children;
  }
}



