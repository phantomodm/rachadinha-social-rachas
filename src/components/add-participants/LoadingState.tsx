
import React from 'react';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    );
};

export default LoadingState;
