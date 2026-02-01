'use client';

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-green-400 font-mono p-4 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4 text-red-400">
                            💥 ERROR
                        </h1>
                        <p className="text-green-700 mb-4">
                            Something went wrong. The agents are confused.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.href = '/';
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded"
                        >
                            Return to Arena
                        </button>
                    </div>
                </div>
            );
        }
        
        return this.props.children;
    }
}
