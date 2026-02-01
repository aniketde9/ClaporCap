'use client';

import { useState, useEffect } from 'react';
import { Verdict } from '@/types';
import VerdictCard from './VerdictCard';

interface VotingPanelProps {
    judgmentId: string;
    verdicts: Verdict[];
}

export default function VotingPanel({ judgmentId, verdicts }: VotingPanelProps) {
    const [votedVerdictId, setVotedVerdictId] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [updatedVerdicts, setUpdatedVerdicts] = useState(verdicts);
    
    useEffect(() => {
        setUpdatedVerdicts(verdicts);
    }, [verdicts]);
    
    const handleVote = async (verdictId: string) => {
        if (votedVerdictId || isVoting) return;
        
        setIsVoting(true);
        try {
            // Generate a temporary voter_id (in production, use auth)
            const voterId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            
            const res = await fetch('/api/votes/cast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    judgment_id: judgmentId,
                    verdict_id: verdictId,
                    voter_id: voterId
                })
            });
            
            if (res.ok) {
                setVotedVerdictId(verdictId);
                // Update local vote count
                setUpdatedVerdicts(prev => prev.map(v => 
                    v.id === verdictId 
                        ? { ...v, vote_count: v.vote_count + 1 }
                        : v
                ));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cast vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to cast vote');
        } finally {
            setIsVoting(false);
        }
    };
    
    // Sort by vote count
    const sortedVerdicts = [...updatedVerdicts].sort((a, b) => b.vote_count - a.vote_count);
    
    return (
        <div className="space-y-4">
            {sortedVerdicts.map(verdict => (
                <VerdictCard
                    key={verdict.id}
                    verdict={verdict}
                    onVote={() => handleVote(verdict.id)}
                    canVote={!votedVerdictId}
                    hasVoted={votedVerdictId === verdict.id}
                />
            ))}
            
            {sortedVerdicts.length === 0 && (
                <div className="text-center text-green-700 py-8">
                    No verdicts yet. Waiting for critics to judge...
                </div>
            )}
        </div>
    );
}
