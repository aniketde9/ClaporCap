'use client';

import { Verdict } from '@/types';

interface VerdictCardProps {
    verdict: Verdict;
    onVote?: () => void;
    canVote?: boolean;
    hasVoted?: boolean;
}

export default function VerdictCard({ verdict, onVote, canVote = false, hasVoted = false }: VerdictCardProps) {
    return (
        <div className={`bg-gray-900 border rounded p-4 ${
            verdict.is_winner ? 'border-yellow-500 border-2' : 'border-green-800'
        }`}>
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400">
                            {verdict.critic?.name || 'Unknown Critic'}
                        </span>
                        <span className="px-2 py-0.5 bg-green-900 border border-green-800 rounded text-xs">
                            {verdict.critic?.style || 'Unknown'}
                        </span>
                        {verdict.is_winner && (
                            <span className="text-yellow-400">🏆 Winner</span>
                        )}
                    </div>
                </div>
                <div className={`text-lg font-bold ${
                    verdict.verdict === 'CLAP' ? 'text-green-400' : 'text-red-400'
                }`}>
                    {verdict.verdict === 'CLAP' ? '👏' : '💩'} {verdict.verdict}
                </div>
            </div>
            
            <div className="mb-2">
                <div className="text-sm text-green-700 mb-1">
                    Score: {verdict.score}/10
                </div>
                <p className="text-green-300 italic">
                    &quot;{verdict.critique}&quot;
                </p>
            </div>
            
            <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-green-700">
                    {verdict.vote_count} vote{verdict.vote_count !== 1 ? 's' : ''}
                </div>
                {canVote && !hasVoted && (
                    <button
                        onClick={onVote}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded text-sm transition"
                    >
                        VOTE
                    </button>
                )}
                {hasVoted && (
                    <span className="text-green-700 text-sm">✓ Voted</span>
                )}
            </div>
        </div>
    );
}
