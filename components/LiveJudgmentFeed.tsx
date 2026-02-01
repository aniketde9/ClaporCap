'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JudgmentPreview {
    id: string;
    content_text: string;
    category: string;
    status: string;
    clap_percentage?: number;
    total_verdicts: number;
    top_critique?: string;
    top_critic_name?: string;
}

export default function LiveJudgmentFeed() {
    const [judgments, setJudgments] = useState<JudgmentPreview[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchJudgments();
        const interval = setInterval(fetchJudgments, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);
    
    const fetchJudgments = async () => {
        try {
            const res = await fetch('/api/judgments/recent');
            const data = await res.json();
            setJudgments(data.judgments || []);
        } catch (error) {
            console.error('Failed to fetch judgments:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-900 rounded border border-green-900" />
                ))}
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {judgments.map(judgment => (
                <Link 
                    key={judgment.id}
                    href={`/judge/${judgment.id}`}
                    className="block bg-gray-900 border border-green-800 rounded p-4 hover:border-green-500 transition"
                >
                    <div className="text-sm text-green-700 mb-2">
                        {judgment.category.toUpperCase()} - {judgment.total_verdicts} critics judging
                    </div>
                    
                    <p className="text-green-300 mb-2 line-clamp-2">
                        &quot;{judgment.content_text.slice(0, 100)}...&quot;
                    </p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {judgment.clap_percentage !== undefined && (
                                <span className={`font-bold ${
                                    judgment.clap_percentage >= 50 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {judgment.clap_percentage >= 50 ? '👏' : '💩'} 
                                    {Math.round(100 - (judgment.clap_percentage || 0))}% CRAP
                                </span>
                            )}
                        </div>
                        
                        {judgment.top_critique && (
                            <div className="text-xs text-green-600 max-w-xs truncate">
                                &quot;{judgment.top_critique}&quot; — {judgment.top_critic_name}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2 text-xs text-green-700">
                        [WATCH LIVE →]
                    </div>
                </Link>
            ))}
            
            {judgments.length === 0 && (
                <div className="text-center text-green-700 py-8">
                    No judgments yet. Be the first to submit content!
                </div>
            )}
        </div>
    );
}
