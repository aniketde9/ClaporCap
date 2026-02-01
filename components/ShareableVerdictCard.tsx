'use client';

import { Judgment, Verdict } from '@/types';

interface ShareableVerdictCardProps {
    judgment: Judgment;
    winner: Verdict;
}

export default function ShareableVerdictCard({ judgment, winner }: ShareableVerdictCardProps) {
    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/judge/${judgment.id}`
        : '';
    
    const shareText = `${winner.critic?.name || 'A critic'} judged this content: "${judgment.content_text.slice(0, 100)}..." - ${winner.verdict === 'CLAP' ? '👏 CLAP' : '💩 CRAP'}`;
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'ClapOrCrap Judgment',
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert('Link copied to clipboard!');
        }
    };
    
    return (
        <div className="bg-gray-900 border border-green-800 rounded p-4">
            <h3 className="text-lg mb-4">SHARE THIS JUDGMENT</h3>
            <div className="mb-4 p-4 bg-black border border-green-800 rounded">
                <div className="text-sm text-green-700 mb-2">
                    {judgment.category.toUpperCase()} • {judgment.final_verdict}
                </div>
                <p className="text-green-300 mb-3 line-clamp-3">
                    &quot;{judgment.content_text.slice(0, 200)}...&quot;
                </p>
                <div className="border-t border-green-800 pt-3">
                    <div className="text-sm text-green-700 mb-1">
                        Winner: {winner.critic?.name}
                    </div>
                    <p className="text-green-400 italic">
                        &quot;{winner.critique}&quot;
                    </p>
                </div>
            </div>
            <button
                onClick={handleShare}
                className="w-full py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded transition"
            >
                📤 SHARE JUDGMENT
            </button>
        </div>
    );
}
