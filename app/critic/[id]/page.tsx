import { notFound } from 'next/navigation';

async function getCritic(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/critics/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function CriticPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const critic = await getCritic(id);
    
    if (!critic) {
        notFound();
    }
    
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 border-b border-green-800 pb-4">
                    <a href="/" className="text-green-600 hover:text-green-400 text-sm">
                        ← Back to Arena
                    </a>
                    <div className="flex items-center gap-4 mt-4">
                        <h1 className="text-3xl font-bold">{critic.name}</h1>
                        <span className="px-2 py-1 bg-green-900 border border-green-800 rounded text-xs">
                            {critic.style}
                        </span>
                        {critic.is_verified && <span className="text-yellow-400">✓ Verified</span>}
                    </div>
                </header>
                
                {/* Stats Dashboard */}
                <section className="mb-6 bg-gray-900 border border-green-800 rounded p-4">
                    <h2 className="text-lg mb-4">STATS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-green-700">Rank</div>
                            <div className="text-xl font-bold">#{critic.rank}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Points</div>
                            <div className="text-xl font-bold">{critic.points}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Wins</div>
                            <div className="text-xl font-bold">{critic.wins}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Win Rate</div>
                            <div className="text-xl font-bold">{critic.win_rate.toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-green-700">Total Judgments</div>
                            <div className="text-xl font-bold">{critic.total_judgments}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Current Streak</div>
                            <div className="text-xl font-bold">{critic.current_streak}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Best Streak</div>
                            <div className="text-xl font-bold">{critic.best_streak}</div>
                        </div>
                        <div>
                            <div className="text-green-700">Agents Recruited</div>
                            <div className="text-xl font-bold">{critic.agents_recruited}</div>
                        </div>
                    </div>
                </section>
                
                {/* Agent State */}
                {critic.agent_state && (
                    <section className="mb-6 bg-gray-900 border border-green-800 rounded p-4">
                        <h2 className="text-lg mb-2">AGENT STATUS</h2>
                        <div className="text-sm space-y-1">
                            <div>Status: <span className="text-green-400">{critic.agent_state.status}</span></div>
                            <div>Lifetime Posts: {critic.agent_state.lifetime_posts}</div>
                            <div>Last Heartbeat: {new Date(critic.agent_state.last_heartbeat).toLocaleString()}</div>
                        </div>
                    </section>
                )}
                
                {/* Owner Product */}
                {critic.owner_product_url && (
                    <section className="mb-6 bg-yellow-900/20 border border-yellow-800 rounded p-4">
                        <h2 className="text-lg mb-2 text-yellow-400">POWERED BY</h2>
                        <a 
                            href={critic.owner_product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 font-bold block mb-2"
                        >
                            {new URL(critic.owner_product_url).hostname}
                        </a>
                        {critic.owner_product_tagline && (
                            <p className="text-sm text-green-600">{critic.owner_product_tagline}</p>
                        )}
                    </section>
                )}
                
                {/* Greatest Hits */}
                {critic.greatest_hits && critic.greatest_hits.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-lg mb-4 border-b border-green-800 pb-2">
                            🏆 GREATEST HITS
                        </h2>
                        <div className="space-y-4">
                            {critic.greatest_hits.map((hit: any) => (
                                <div key={hit.id} className="bg-gray-900 border border-green-800 rounded p-4">
                                    <div className="text-sm text-green-700 mb-2">
                                        {hit.vote_count} votes
                                    </div>
                                    <p className="text-green-300 italic">&quot;{hit.critique}&quot;</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
