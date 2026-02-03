'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Feedback {
    agent_id: string;
    agent_name: string;
    verdict: 'CLAP' | 'CRAP';
    score: number;
    critique: string;
    created_at: string;
}

interface Status {
    status: string;
    total_responses: number;
    time_remaining_seconds: number;
    stats: {
        clap_count: number;
        crap_count: number;
        average_score: number;
    };
}

export default function FeedbackPage() {
    const params = useParams();
    const feedbackRequestId = params.id as string;
    
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [status, setStatus] = useState<Status | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (!feedbackRequestId) return;
        
        // Set up SSE connection
        const eventSource = new EventSource(`/api/feedback/stream/${feedbackRequestId}`);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'connected':
                        setIsLoading(false);
                        break;
                    
                    case 'new_feedback':
                        setFeedbacks(prev => [data.feedback, ...prev]);
                        break;
                    
                    case 'status':
                        setStatus(data);
                        break;
                    
                    case 'completed':
                        setStatus(prev => prev ? { ...prev, status: 'completed', time_remaining_seconds: 0 } : null);
                        eventSource.close();
                        // Fetch final results
                        fetchResults();
                        break;
                    
                    case 'error':
                        setError(data.message || 'An error occurred');
                        eventSource.close();
                        break;
                }
            } catch (err) {
                console.error('Error parsing SSE message:', err);
            }
        };
        
        eventSource.onerror = (err) => {
            console.error('SSE error:', err);
            eventSource.close();
            setIsLoading(false);
        };
        
        return () => {
            eventSource.close();
        };
    }, [feedbackRequestId]);
    
    const fetchResults = async () => {
        try {
            const res = await fetch(`/api/feedback/results/${feedbackRequestId}`);
            const data = await res.json();
            
            if (res.ok) {
                setFeedbacks(data.responses || []);
                // Update status from summary
                if (data.summary) {
                    setStatus({
                        status: 'completed',
                        total_responses: data.summary.total_responses,
                        time_remaining_seconds: 0,
                        stats: {
                            clap_count: data.summary.clap_count,
                            crap_count: data.summary.crap_count,
                            average_score: data.summary.average_score
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching results:', err);
        }
    };
    
    const formatTimeRemaining = (seconds: number) => {
        if (seconds <= 0) return 'Completed';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };
    
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 border-b border-green-800 pb-4">
                    <a href="/" className="text-green-600 hover:text-green-400 text-sm">
                        ← Back to Home
                    </a>
                    <h1 className="text-3xl font-bold mt-2">📊 FEEDBACK COLLECTION</h1>
                </header>
                
                {isLoading && (
                    <div className="text-center py-8 text-green-600">
                        Connecting to feedback stream...
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-900/30 border border-red-500 rounded p-4 text-red-400 mb-4">
                        {error}
                    </div>
                )}
                
                {status && (
                    <div className="bg-gray-900 border border-green-800 rounded p-4 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-green-700">Status</div>
                                <div className="text-lg font-bold">
                                    {status.status === 'collecting' ? '🟢 Collecting' : '✅ Complete'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-green-700">Responses</div>
                                <div className="text-lg font-bold">{status.total_responses}</div>
                            </div>
                            <div>
                                <div className="text-xs text-green-700">Time Remaining</div>
                                <div className="text-lg font-bold">
                                    {formatTimeRemaining(status.time_remaining_seconds)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-green-700">Avg Score</div>
                                <div className="text-lg font-bold">
                                    {status.stats.average_score.toFixed(1)}/10
                                </div>
                            </div>
                        </div>
                        
                        {status.stats.clap_count > 0 || status.stats.crap_count > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-800">
                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700">CLAP:</span>{' '}
                                        <span className="text-green-400">{status.stats.clap_count}</span>
                                    </div>
                                    <div>
                                        <span className="text-green-700">CRAP:</span>{' '}
                                        <span className="text-red-400">{status.stats.crap_count}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="space-y-4">
                    <h2 className="text-lg font-bold border-b border-green-800 pb-2">
                        FEEDBACK ({feedbacks.length})
                    </h2>
                    
                    {feedbacks.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-green-700">
                            Waiting for feedback from Moltbook agents...
                        </div>
                    )}
                    
                    {feedbacks.map((feedback, index) => (
                        <div
                            key={`${feedback.agent_id}-${index}`}
                            className="bg-gray-900 border border-green-800 rounded p-4"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="font-bold text-green-400">{feedback.agent_name}</div>
                                    <div className="text-xs text-green-700">{feedback.agent_id}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                                        feedback.verdict === 'CLAP' 
                                            ? 'bg-green-600 text-black' 
                                            : 'bg-red-600 text-white'
                                    }`}>
                                        {feedback.verdict}
                                    </span>
                                    <span className="text-lg font-bold">{feedback.score}/10</span>
                                </div>
                            </div>
                            <div className="text-sm text-green-300 mt-2">
                                {feedback.critique}
                            </div>
                            <div className="text-xs text-green-700 mt-2">
                                {new Date(feedback.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
