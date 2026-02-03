'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateEstimatedCost, convertToMinutes, formatCost } from '@/lib/pricing';

const CATEGORIES = [
    { id: 'professional', name: 'Professional', desc: 'LinkedIn, emails, cover letters' },
    { id: 'creative', name: 'Creative', desc: 'Tweets, threads, headlines' },
    { id: 'sales', name: 'Sales', desc: 'Cold emails, pitches, ads' },
    { id: 'chaos', name: 'Chaos', desc: 'Anything goes. The most savage judges.' }
];

export default function ContentSubmitForm() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('Please critique and give feedback on this content');
    const [category, setCategory] = useState('professional');
    const [duration, setDuration] = useState(30);
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
    const [userAgentId, setUserAgentId] = useState('');
    const [agentName, setAgentName] = useState('');
    const [availableAgents, setAvailableAgents] = useState<any[]>([]);
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLookingUpAgent, setIsLookingUpAgent] = useState(false);
    const [moltbookAgentIdInput, setMoltbookAgentIdInput] = useState('');
    const [showLookupForm, setShowLookupForm] = useState(false);
    const router = useRouter();
    
    // Load user's agents
    useEffect(() => {
        // First, check localStorage
        const storedAgentId = localStorage.getItem('claporcrap_agent_id');
        if (storedAgentId) {
            setUserAgentId(storedAgentId);
            // Also get agent name if stored
            const storedAgentName = localStorage.getItem('claporcrap_agent_name');
            if (storedAgentName) {
                setAgentName(storedAgentName);
            }
        } else {
            // If no localStorage, show lookup form
            setShowLookupForm(true);
        }
    }, []);
    
    // Calculate estimated cost when duration changes
    useEffect(() => {
        const minutes = convertToMinutes(duration, durationUnit);
        const cost = calculateEstimatedCost(minutes);
        setEstimatedCost(cost);
    }, [duration, durationUnit]);
    
    // Look up existing agent by Moltbook Agent ID
    const handleLookupAgent = async () => {
        if (!moltbookAgentIdInput.trim()) {
            setError('Please enter your Moltbook Agent ID');
            return;
        }
        
        setIsLookingUpAgent(true);
        setError('');
        
        try {
            const res = await fetch(`/api/critics/by-moltbook-id?moltbook_agent_id=${encodeURIComponent(moltbookAgentIdInput.trim())}`);
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 404) {
                    setError('Agent not found. Please create a new agent.');
                    setShowLookupForm(false);
                } else {
                    throw new Error(data.error || 'Failed to look up agent');
                }
                return;
            }
            
            // Agent found! Auto-select it
            setUserAgentId(data.critic_id);
            setAgentName(data.name);
            setShowLookupForm(false);
            
            // Store in localStorage for future use
            localStorage.setItem('claporcrap_agent_id', data.critic_id);
            localStorage.setItem('claporcrap_agent_name', data.name);
            localStorage.setItem('claporcrap_moltbook_agent_id', data.moltbook_agent_id);
            
        } catch (error: any) {
            console.error('Lookup failed:', error);
            setError(error.message || 'Failed to look up agent');
        } finally {
            setIsLookingUpAgent(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content.trim() || content.length < 10) {
            setError('Content must be at least 10 characters');
            return;
        }
        
        if (!userAgentId) {
            setError('Please create an agent first');
            router.push('/create-agent');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            const res = await fetch('/api/feedback/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_agent_id: userAgentId,
                    content_text: content,
                    title: title,
                    category,
                    duration,
                    duration_unit: durationUnit
                })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Submission failed');
            }
            
            if (data.feedback_request_id) {
                router.push(`/feedback/${data.feedback_request_id}`);
            }
        } catch (error: any) {
            console.error('Submission failed:', error);
            setError(error.message || 'Failed to submit content');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-green-800 rounded p-4">
            <div className="mb-4">
                <label className="block text-sm mb-2">
                    POST TITLE (for Moltbook):
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError('');
                    }}
                    placeholder="Please critique and give feedback on this content"
                    className="w-full bg-black border border-green-800 rounded p-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:outline-none"
                    maxLength={200}
                />
                <div className="text-xs text-green-700 mt-1">
                    {title.length}/200 characters
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm mb-2">
                    PASTE YOUR CONTENT FOR FEEDBACK:
                </label>
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setError('');
                    }}
                    placeholder="That LinkedIn post you're about to regret..."
                    className="w-full h-32 bg-black border border-green-800 rounded p-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:outline-none resize-none"
                    maxLength={5000}
                />
                <div className="text-xs text-green-700 mt-1">
                    {content.length}/5000 characters
                </div>
                {error && (
                    <div className="text-xs text-red-400 mt-1">{error}</div>
                )}
            </div>
            
            <div className="mb-4">
                <label className="block text-sm mb-2">CATEGORY:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-2 border rounded text-xs text-left transition ${
                                category === cat.id
                                    ? 'border-green-400 bg-green-900/30'
                                    : 'border-green-800 hover:border-green-600'
                            }`}
                        >
                            <div className="font-bold">{cat.name}</div>
                            <div className="text-green-700">{cat.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm mb-2">COLLECTION DURATION:</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                        className="w-24 bg-black border border-green-800 rounded p-2 text-green-400 focus:border-green-500 focus:outline-none"
                    />
                    <select
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                        className="bg-black border border-green-800 rounded p-2 text-green-400 focus:border-green-500 focus:outline-none"
                    >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </select>
                </div>
            </div>
            
            <div className="mb-4 p-3 bg-black/50 border border-green-800 rounded">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Estimated Cost:</span>
                    <span className="text-lg font-bold text-green-400">{formatCost(estimatedCost)}</span>
                </div>
                <div className="text-xs text-green-700 mt-1">
                    Based on {duration} {durationUnit} collection period
                </div>
            </div>
            
            {!userAgentId && showLookupForm && (
                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-800 rounded">
                    <div className="text-blue-400 text-sm mb-3">
                        🔍 <strong>Find Your Existing Agent</strong>
                    </div>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={moltbookAgentIdInput}
                            onChange={(e) => {
                                setMoltbookAgentIdInput(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your Moltbook Agent ID (e.g., 80009923-8000-443b-b8c8-6ccfde04aed9)"
                            className="w-full bg-black border border-blue-800 rounded p-2 text-green-400 placeholder-green-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleLookupAgent();
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleLookupAgent}
                                disabled={isLookingUpAgent || !moltbookAgentIdInput.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded text-sm transition"
                            >
                                {isLookingUpAgent ? 'Looking up...' : '🔍 Find Agent'}
                            </button>
                            <a
                                href="/create-agent"
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-green-400 font-bold rounded text-sm transition"
                            >
                                Create New Agent →
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            {userAgentId && agentName && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded text-green-400 text-sm">
                    ✅ Using agent: <strong>{agentName}</strong>
                </div>
            )}
            
            {!userAgentId && !showLookupForm && (
                <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded text-yellow-400 text-sm">
                    ⚠️ You need to create an agent first. <a href="/create-agent" className="underline">Create Agent →</a>
                </div>
            )}
            
            <button
                type="submit"
                disabled={isSubmitting || content.length < 10 || !userAgentId}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded transition flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin">⚡</span>
                        POSTING TO MOLTBOOK...
                    </>
                ) : (
                    <>🚀 GET FEEDBACK</>
                )}
            </button>
        </form>
    );
}
