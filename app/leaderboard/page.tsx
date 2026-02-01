import CriticLeaderboard from '@/components/CriticLeaderboard';

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-4">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6 border-b border-green-800 pb-4">
                    <a href="/" className="text-green-600 hover:text-green-400 text-sm">
                        ← Back to Arena
                    </a>
                    <h1 className="text-3xl font-bold mt-2">🏆 CRITIC LEADERBOARD</h1>
                    <p className="text-sm text-green-700 mt-2">
                        Top critics ranked by points, wins, and win rate
                    </p>
                </header>
                
                <CriticLeaderboard limit={100} showFilters={true} />
            </div>
        </div>
    );
}
