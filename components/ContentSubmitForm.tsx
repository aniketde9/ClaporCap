'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    { id: 'professional', name: 'Professional', desc: 'LinkedIn, emails, cover letters' },
    { id: 'creative', name: 'Creative', desc: 'Tweets, threads, headlines' },
    { id: 'sales', name: 'Sales', desc: 'Cold emails, pitches, ads' },
    { id: 'chaos', name: 'Chaos', desc: 'Anything goes. The most savage judges.' }
];

export default function ContentSubmitForm() {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('professional');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.length < 10) {
            setError('Content must be at least 10 characters');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            const res = await fetch('/api/content/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content_text: content, category })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Submission failed');
            }
            
            if (data.judgment_id) {
                router.push(`/judge/${data.judgment_id}`);
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
                    PASTE YOUR CONTENT FOR JUDGMENT:
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
            
            <button
                type="submit"
                disabled={isSubmitting || content.length < 10}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded transition flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin">⚡</span>
                        SUMMONING CRITICS...
                    </>
                ) : (
                    <>🎯 JUDGE ME</>
                )}
            </button>
        </form>
    );
}
