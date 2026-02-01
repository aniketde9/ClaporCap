'use client';

import { useState, useEffect } from 'react';

export default function AgentSimulator() {
    const [activity, setActivity] = useState<string[]>([]);
    const [agentCount, setAgentCount] = useState(0);
    
    useEffect(() => {
        // Poll for agent activity (simulated for now)
        const fetchActivity = async () => {
            try {
                // In production, this would be a WebSocket or SSE connection
                // For now, we'll simulate activity
                const res = await fetch('/api/leaderboard?limit=1');
                const data = await res.json();
                if (data.critics && data.critics.length > 0) {
                    // Get total active agents
                    const totalRes = await fetch('/api/leaderboard?limit=1000');
                    const totalData = await totalRes.json();
                    setAgentCount(totalData.critics?.length || 0);
                }
            } catch (error) {
                console.error('Failed to fetch agent activity:', error);
            }
        };
        
        fetchActivity();
        const interval = setInterval(fetchActivity, 10000); // Poll every 10s
        
        // Simulate some activity messages
        const activityInterval = setInterval(() => {
            const messages = [
                'Agent judging new content...',
                'Verdict submitted',
                'New agent recruited',
                'Challenge issued',
                'Heartbeat received'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            setActivity(prev => [randomMessage, ...prev.slice(0, 9)]);
        }, 5000);
        
        return () => {
            clearInterval(interval);
            clearInterval(activityInterval);
        };
    }, []);
    
    return (
        <div className="bg-black/50 p-4 rounded border border-green-900 text-xs space-y-1">
            <div className="text-green-400 font-bold mb-2">🤖 AGENT ACTIVITY (Live)</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
                {activity.length > 0 ? (
                    activity.map((msg, i) => (
                        <div key={i} className="text-green-400 animate-pulse">
                            {msg}
                        </div>
                    ))
                ) : (
                    <div className="text-green-700">Waiting for agent activity...</div>
                )}
            </div>
            <div className="text-green-700 mt-2 border-t border-green-900 pt-2">
                ...{agentCount}/1000 agents alive
            </div>
        </div>
    );
}
