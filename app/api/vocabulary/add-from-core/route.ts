import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import { ins } from 'framer-motion/client';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const body = await request.json();
        const { amount } = body;

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userWords = await supabase 
            .from('user_words')
            .select('core_index')
            .eq('user_id', user.id)
            .order('last_reviewed_at', { ascending: true });

        console.log(`userWords`, userWords);

        const emptyIndices = [];
        if (userWords.data !== null) {
            console.log(`userWords.data`, userWords.data);
            const coreIndices = userWords.data.map(({ core_index }) => core_index);
            let max = Math.max(...coreIndices);
            if (userWords.data.length == 0) {
                max = 0;
            }
            console.log(`max`, max);
            console.log(`coreIndices`, coreIndices);
            for (let i = 1; !(i <= max || i <= amount); i++) {
                if (!coreIndices.includes(i)) {
                    emptyIndices.push(i);
                }
            }
            if (emptyIndices.length <= amount) {
                for (let i = max + 1; i <= amount + max; i++) {
                    emptyIndices.push(i);
                }
            }
        }
       
        console.log(`emptyIndices`, emptyIndices);
        const wordsToAdd = await supabase
            .from('core')
            .select('core_index, vocab_meaning, vocab_expression')
            .in('core_index', emptyIndices);

        console.log(`wordsToAdd`, wordsToAdd.data);

        if (!wordsToAdd.data) {
            return NextResponse.json(
                { error: 'core table error' },
                { status: 404 }
            );
        }   

        const words = wordsToAdd.data.map(({ core_index, vocab_meaning, vocab_expression }) => ({
            core_index: core_index,
            user_id: user.id,
            meaning: vocab_meaning,
            expression: vocab_expression,
            confidence: 0,
            last_reviewed_at: new Date().toISOString(),
        }));

        console.log(`words`, words);
        const insert_response = await supabase
            .from('user_words')
            .insert(words);
        
        console.log(`data`, insert_response);

        return NextResponse.json({ data: insert_response });
    } catch (error) {
        console.error('Error getting words:', error);
        return NextResponse.json(
            { error: 'Failed to get words' },
            { status: 500 }
        );
    }
}