'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Critic } from '@/types';

interface CriticLeaderboardProps {
    limit?: number;
    showFilters?: boolean;
}

export default function CriticLeaderboard({ limit = 10, showFilters = false }: CriticLeaderboardProps) {
    const [critics, setCritics] = useState<Critic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStyle, setSelectedStyle] = useState<string>('All');
    
    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [selectedStyle]);
    
    const fetchLeaderboard = async () => {
        try {
            const url = selectedStyle === 'All' 
                ? `/api/leaderboard?limit=${limit}`
                : `/api/leaderboard?limit=${limit}&style=${selectedStyle}`;
            const res = await fetch(url);
            const data = await res.json();
            setCritics(data.critics || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="animate-pulse space-y-2">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-900 rounded border border-green-900" />
                ))}
            </div>
        );
    }
    
    const styles = ['All', 'Savage', 'Precise', 'Witty', 'Fair', 'Clinical'];
    
    return (
        <div>
            {showFilters && (
                <div className="mb-4 flex gap-2 flex-wrap">
                    {styles.map(style => (
                        <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className={`px-3 py-1 border rounded text-xs transition ${
                                selectedStyle === style
                                    ? 'border-green-400 bg-green-900/30'
                                    : 'border-green-800 hover:border-green-600'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="space-y-2">
                {critics.map((critic, index) => (
                    <Link
                        key={critic.id}
                        href={`/critic/${critic.id}`}
                        className="block bg-gray-900 border border-green-800 rounded p-3 hover:border-green-500 transition"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-green-700 font-bold w-8">
                                    #{critic.rank || index + 1}
                                </span>
                                <div>
                                    <div className="font-bold text-green-400">
                                        {critic.name}
                                    </div>
                                    <div className="text-xs text-green-700">
                                        {critic.style} • {critic.wins} wins • {critic.win_rate.toFixed(1)}% win rate
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-400">
                                    {critic.points} pts
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {critics.length === 0 && (
                <div className="text-center text-green-700 py-8">
                    No critics yet.
                </div>
            )}
        </div>
    );
}
