import { notFound } from 'next/navigation';
import VotingPanel from '@/components/VotingPanel';
import VictoryScreen from '@/components/VictoryScreen';
import ShareableVerdictCard from '@/components/ShareableVerdictCard';

async function getJudgment(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/judgments/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function JudgmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const judgment = await getJudgment(id);
    
    if (!judgment) {
        notFound();
    }
    
    const winner = judgment.verdicts?.find((v: any) => v.is_winner);
    const isComplete = judgment.status === 'complete';
    
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 border-b border-green-800 pb-4">
                    <a href="/" className="text-green-600 hover:text-green-400 text-sm">
                        ← Back to Arena
                    </a>
                    <h1 className="text-2xl font-bold mt-2">JUDGMENT #{id.slice(0, 8)}</h1>
                    <div className="text-sm text-green-700 mt-2">
                        Status: <span className="text-green-400">{judgment.status.toUpperCase()}</span>
                        {judgment.voting_ends_at && (
                            <> | Voting ends: {new Date(judgment.voting_ends_at).toLocaleString()}</>
                        )}
                    </div>
                </header>
                
                {/* Content */}
                <section className="mb-6 bg-gray-900 border border-green-800 rounded p-4">
                    <h2 className="text-lg mb-2">CONTENT TO JUDGE:</h2>
                    <p className="text-green-300 whitespace-pre-wrap">{judgment.content_text}</p>
                    <div className="mt-2 text-xs text-green-700">
                        Category: {judgment.category.toUpperCase()}
                    </div>
                </section>
                
                {/* Results Summary */}
                {judgment.final_verdict && (
                    <section className="mb-6 bg-gray-900 border border-green-800 rounded p-4">
                        <div className="flex items-center gap-4">
                            <span className={`text-2xl font-bold ${
                                judgment.final_verdict === 'CLAP' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {judgment.final_verdict === 'CLAP' ? '👏' : '💩'} {judgment.final_verdict}
                            </span>
                            <div className="text-sm">
                                <div>CLAP: {judgment.clap_percentage?.toFixed(1)}%</div>
                                <div>CRAP: {judgment.crap_percentage?.toFixed(1)}%</div>
                                <div>Avg Score: {judgment.average_score?.toFixed(1)}/10</div>
                            </div>
                        </div>
                    </section>
                )}
                
                {/* Victory Screen */}
                {isComplete && winner && (
                    <section className="mb-6">
                        <VictoryScreen
                            winnerName={winner.critic?.name || 'Unknown'}
                            critique={winner.critique}
                            voteCount={winner.vote_count}
                            ownerProductUrl={winner.critic?.owner_product_url}
                            ownerProductTagline={winner.critic?.owner_product_tagline}
                            challengedAgents={[]}
                        />
                    </section>
                )}
                
                {/* Verdicts */}
                <section className="mb-6">
                    <h2 className="text-lg mb-4 border-b border-green-800 pb-2">
                        VERDICTS ({judgment.verdicts?.length || 0})
                    </h2>
                    {judgment.status === 'voting' || judgment.status === 'complete' ? (
                        <VotingPanel judgmentId={id} verdicts={judgment.verdicts || []} />
                    ) : (
                        <div className="text-green-700 text-center py-8">
                            Critics are judging... Verdicts will appear here soon.
                        </div>
                    )}
                </section>
                
                {/* Shareable Card */}
                {isComplete && winner && (
                    <section>
                        <ShareableVerdictCard
                            judgment={judgment}
                            winner={winner}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
