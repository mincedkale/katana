import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const body = await request.json();
        const { 
            amount: number,
        } = body;

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const response = await supabase
            .from('user_words')
            .select('meaning, confidence, expression, last_reviewed_at')
            .eq('user_id', user.id)
            .order('last_reviewed_at', { ascending: true })
            .limit(number);

        console.log(`response`, response);

        return NextResponse.json({ data: response.data });
    } catch (error) {
        console.error('Error getting words:', error);
        return NextResponse.json(
            { error: 'Failed to get words' },
            { status: 500 }
        );
    }
}