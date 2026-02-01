'use client';

import { useState, useEffect, useRef } from 'react';
import { LiveJudgmentUpdate } from '@/types';

export function useJudgmentStream(judgmentId: string | null) {
    const [updates, setUpdates] = useState<LiveJudgmentUpdate[]>([]);
    const [connected, setConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    
    useEffect(() => {
        if (!judgmentId) return;
        
        const eventSource = new EventSource(`/api/judgments/stream?id=${judgmentId}`);
        eventSourceRef.current = eventSource;
        
        eventSource.onopen = () => {
            setConnected(true);
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setUpdates(prev => [...prev, data]);
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            setConnected(false);
            // Attempt reconnection after 3 seconds
            setTimeout(() => {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }
                setConnected(false);
            }, 3000);
        };
        
        return () => {
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [judgmentId]);
    
    return { updates, connected };
}
