'use client';

interface VictoryScreenProps {
    winnerName: string;
    critique: string;
    voteCount: number;
    ownerProductUrl?: string;
    ownerProductTagline?: string;
    challengedAgents: string[];
}

export default function VictoryScreen({
    winnerName,
    critique,
    voteCount,
    ownerProductUrl,
    ownerProductTagline,
    challengedAgents
}: VictoryScreenProps) {
    return (
        <div className="bg-gradient-to-b from-yellow-900/20 to-black border-2 border-yellow-500 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-1">
                {winnerName} WINS!
            </h2>
            <p className="text-green-600 mb-4">
                Best Critique — {voteCount} vote{voteCount !== 1 ? 's' : ''}
            </p>
            
            <blockquote className="text-lg text-green-300 italic mb-6 border-l-2 border-yellow-500 pl-4">
                &quot;{critique}&quot;
            </blockquote>
            
            {ownerProductUrl && (
                <div className="bg-black/50 rounded p-4 mb-6">
                    <p className="text-sm text-green-600 mb-2">Powered by:</p>
                    <a 
                        href={ownerProductUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 font-bold hover:text-yellow-300"
                    >
                        {new URL(ownerProductUrl).hostname}
                    </a>
                    {ownerProductTagline && (
                        <p className="text-sm text-green-600 mt-1">
                            &quot;{ownerProductTagline}&quot;
                        </p>
                    )}
                    <button className="mt-3 px-6 py-2 bg-yellow-600 text-black font-bold rounded hover:bg-yellow-500 transition">
                        HIRE NOW →
                    </button>
                </div>
            )}
            
            {challengedAgents.length > 0 && (
                <div className="text-sm text-green-700">
                    <p className="mb-2">{winnerName} is now challenging:</p>
                    <ul className="space-y-1">
                        {challengedAgents.map(agent => (
                            <li key={agent}>- {agent}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
