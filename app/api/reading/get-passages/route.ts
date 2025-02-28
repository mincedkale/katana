import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface VocabularyWord {
    core_index: string;
    expression: string;
    meaning: string;
    last_reviewed_at: string;
    confidence: number;
}

interface Passage {
    texts: ClaudeResponse;
    words: VocabularyWord[];
}

interface ClaudeResponse {
    japanese: string;
    english: string;
    explanation: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { amount, sentences } = await request.json();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const response = await supabase
            .from('user_words')
            .select('core_index, meaning, confidence, expression, last_reviewed_at')
            .eq('user_id', user.id)
            .order('core_index', { ascending: true })
            .limit(50);

        console.log(`response`, response);
        if (!response.data) {
            return NextResponse.json(
                { error: 'No words found' },
                { status: 404 }
            );
        }
        const grammar = 'N4'
        const level = '4'
        const numWordsPerPassage = 10;

        const passages: Passage[] = [];

        for (let i = 0; i < amount; i++) {
            const wordsSlice = response.data.slice(i * numWordsPerPassage, (i + 1) * numWordsPerPassage);
            const words = wordsSlice.map(({ expression, meaning }) => ({ expression, meaning }));
            const req = `You are tasked with creating a simple Japanese passage for language learners. 
                        Your goal is to craft a passage that incorporates specific grammar patterns and vocabulary 
                        while maintaining an appropriate difficulty level.\n\nHere are the input variables you will 
                        work with:\n\n<sentence_length>\n${sentences}\n</sentence_length>\n\n<grammar_patterns>\n
                        ${grammar}\n</grammar_patterns>\n\n<n_level>\n${level}\n</n_level>\n\n<words to specifically and mainly incorporate>\n
                        ${JSON.stringify(words)}\n<words to specifically and mainly incorporate>>\n\nFollow these steps to create the passage:\n\n1. Grammar Patterns:\n   - 
                        If grammar patterns are provided in the <grammar_patterns> section, incorporate them into your passage.\n  
                        - If no patterns are given or not enough are provided, use grammar and sentence structures appropriate 
                        for Japanese Level N${level}.\n\n2. Vocabulary:\n   - Include all the words provided in the <words to specifically and mainly incorporate>
                        section in your passage.\n   - Supplement these with other common words suitable for Japanese Level 
                        N${level} though these SHOULD NOT be your main focus. You must only reference vocabulary included in <words to specifically and mainly
                        incorporate> within your explanation response. \n\n3. Difficulty Level:\n   - Tailor the overall difficulty of the passage to Japanese 
                        Level N${level}.\n   - Use vocabulary (given here or otherwise), kanji, and grammatical structures that align with this level.
                        \n\n4. Length:\n   - Aim for a passage length of approximately ${sentences}.\n   
                        - This can be interpreted as either the number of sentences or the total character count, 
                        depending on what seems more appropriate for the given N${level}.\n\n5. Content:\n   
                        - Create a coherent passage with a simple theme or story that naturally incorporates the 
                        required elements.\n   - Ensure the content is appropriate for language learners and avoids 
                        overly complex or culturally specific topics.\n\nPlease provide your output in the following format as an object: {\n
                        japanese: "[Your Japanese passage here]\n english:"[English translation of the passage]"\n
                        explanation:"[Brief explanation of the grammar patterns and key vocabulary used, highlighting how they 
                        align with the N${level} difficulty]"}\n\nRemember to focus on 
                        creating a passage that is both educational and engaging for language learners at the specified level.\n\n
                        Please make ensure that the entirety of your response is able to be parsed into JSON format. This means
                        that all strings must be enclosed in double quotes, and all keys must be enclosed in double quotes as well. All
                        with no extra spaces, line breaks (such as \\n), or any other words.`;
            console.log(req);
            const msg = await anthropic.messages.create({
                model: "claude-3-7-sonnet-20250219",
                max_tokens: 20000,
                temperature: 1,
                messages: [
                {
                    "role": "user",
                    "content": [
                    {
                        "type": "text",
                        "text": req
                    }
                    ]
                }
                ]
            });
            console.log(msg);
            const responseText = msg.content[0].type === 'text' && msg.content[0].text;
            if (!responseText) {
                return NextResponse.json(
                    { error: 'Failed to generate passage' },
                    { status: 500 }
                );
            }
            let responseOjb;
            try {
                responseOjb = JSON.parse(responseText) as ClaudeResponse;
            } catch (error) {
                const msg = await anthropic.messages.create({
                    model: "claude-3-7-sonnet-20250219",
                    max_tokens: 20000,
                    temperature: 1,
                    messages: [
                    {
                        "role": "user",
                        "content": [
                        {
                            "type": "text",
                            "text": `You are tasked with formatting this passage into a valid string JSON object able to be
                            run through JSON.parse(). The format should be as follows: {\n
                            "japanese": "string"\n
                            "english": "string"\n
                            "explanation": "string"\n} Do not include any extra spaces, line breaks, or any other words. Your response should
                            be able to be parsed into JSON format without any issues. Keep the content of the passage the same, but ensure that it is
                            formatted correctly.`
                        }
                        ]
                    }
                    ]
                });
                let responseText = msg.content[0].type === 'text' && msg.content[0].text;
                if (!responseText) {
                    return NextResponse.json(
                        { error: 'Failed to generate passage' },
                        { status: 500 }
                    );
                }
                responseOjb = JSON.parse(responseText) as ClaudeResponse;
            }
            
            const passage = {
                texts: responseOjb,
                words: words
            } as Passage;
            passages.push(passage);
        }

        return NextResponse.json({ passages: passages });
    } catch (error) {
        console.error('Error getting words:', error);
        return NextResponse.json(
            { error: 'Failed to get words' },
            { status: 500 }
        );
    }
}