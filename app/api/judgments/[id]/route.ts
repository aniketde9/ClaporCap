import { NextRequest, NextResponse } from 'next/server';
import { getJudgmentWithVerdicts } from '@/lib/judgments';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await getJudgmentWithVerdicts(id);
        
        if (!result) {
            return NextResponse.json(
                { error: 'Judgment not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            ...result.judgment,
            verdicts: result.verdicts
        });
        
    } catch (error) {
        console.error('Error fetching judgment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch judgment' },
            { status: 500 }
        );
    }
}
