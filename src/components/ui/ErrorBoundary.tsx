"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-[2.5rem] border border-dashed border-red-200 gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-red-900 tracking-tight">Something went wrong</h3>
          <p className="text-sm text-red-800/70 max-w-sm mb-4">
            {this.props.fallbackMessage || "An unexpected error occurred while loading this section. Please try again."}
          </p>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
