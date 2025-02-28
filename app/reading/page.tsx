'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, Chip, CircularProgress, Button } from '@mui/material';
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation';

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

export default function ReadingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [passage, setPassage] = useState<Passage[]>([]);
    const [loading, setLoading] = useState(true);
    const [amountPassages, setAmountPassages] = useState(1);
    const [sentenceCount, setSentenceCount] = useState(5);
    const [userId, setUserId] = useState<string | null>(null);

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getUser();
            
            if (error || !data?.user) {
                router.push('/login');
                return;
            }
            
            setUserId(data.user.id);
            // After authentication check, fetch passages
            fetchPassages(data.user.id);
        };
        
        checkAuth();
    }, [router]);

    const fetchPassages = async (id: string) => {
        if (!id) return;
        
        try {
            const response = await fetch('/api/reading/get-passages', {
                method: 'POST',
                body: JSON.stringify({ 
                    amount: amountPassages, 
                    sentences: sentenceCount, 
                    user_id: id 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const passages_data = await response.json();
            console.log(passages_data);
            // Assuming the API returns passage data
            setPassage(passages_data.passages);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch passages:', error);
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Reading Practice
                </Typography>
                <Typography variant="body1" paragraph>
                    Read passages to improve your comprehension and vocabulary.
                </Typography>
            </Box>
            
            {passage.length > 0 ? (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Passage
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {passage[0].texts.japanese}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                        {/* Toggle buttons for English, Explanation, and Vocabulary */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    const englishEl = document.getElementById('english-translation');
                                    if (englishEl) {
                                        englishEl.style.display = englishEl.style.display === 'none' ? 'block' : 'none';
                                    }
                                }}
                            >
                                Toggle English
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    const explanationEl = document.getElementById('explanation');
                                    if (explanationEl) {
                                        explanationEl.style.display = explanationEl.style.display === 'none' ? 'block' : 'none';
                                    }
                                }}
                            >
                                Toggle Explanation
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    const vocabularyEl = document.getElementById('vocabulary-list');
                                    if (vocabularyEl) {
                                        vocabularyEl.style.display = vocabularyEl.style.display === 'none' ? 'block' : 'none';
                                    }
                                }}
                            >
                                Toggle Vocabulary
                            </Button>
                        </Box>
                        
                        {/* English translation (hidden by default) */}
                        <Box id="english-translation" sx={{ display: 'none', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">English:</Typography>
                            <Typography variant="body1">
                                {passage[0].texts.english}
                            </Typography>
                        </Box>
                        
                        {/* Explanation (hidden by default) */}
                        <Box id="explanation" sx={{ display: 'none' }}>
                            <Typography variant="subtitle1" fontWeight="bold">Explanation:</Typography>
                            <Typography variant="body1">
                                {passage[0].texts.explanation}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Vocabulary section (now toggleable) */}
                    <Box id="vocabulary-list" sx={{ mt: 4 }} style={{ display: 'none' }}>
                        <Typography variant="h6" gutterBottom>
                            Vocabulary
                        </Typography>
                        <List>
                            {passage[0].words.map((word, index) => (
                                <ListItem key={index}>
                                    <ListItemText 
                                        primary={word.expression}
                                        secondary={word.meaning}
                                    />
                                    <Chip 
                                        label={`Confidence: ${word.confidence}`} 
                                        color={word.confidence > 0.7 ? "success" : word.confidence > 0.4 ? "warning" : "error"} 
                                        size="small"
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="Passage" />
                            <Tab label="Settings" />
                        </Tabs>
                    </Box>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => {
                                // Remove the current passage
                                const newPassages = [...passage];
                                newPassages.shift();
                                
                                // If only one passage left, fetch more
                                if (newPassages.length <= 1 && userId) {
                                    fetchPassages(userId);
                                }
                                
                                setPassage(newPassages);
                            }}
                        >
                            Next Passage
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography>No passages available. Loading new content...</Typography>
                    <CircularProgress sx={{ ml: 2 }} />
                </Paper>
            )}
        </Container>
    );
}