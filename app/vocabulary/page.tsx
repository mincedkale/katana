'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';



interface VocabularyWord {
    id: string;
    word: string;
    translation: string;
    learned: boolean;
    lastReviewed: Date;
    proficiencyLevel: number; // 0-100
}

export default function VocabularyPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [learningWords, setLearningWords] = useState<VocabularyWord[]>([]);
    const [learnedWords, setLearnedWords] = useState<VocabularyWord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch vocabulary data
        const fetchVocabulary = async () => {
            try {
                // This would be replaced with your actual API call
                const response = await fetch('/api/vocabulary/get-words', {
                    method: 'POST',
                    body: JSON.stringify({ amount: 100 }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    });
                const data = await response.json();
                
                // Split words into learning and learned categories
                const learning = data.filter((word: VocabularyWord) => !word.learned);
                const learned = data.filter((word: VocabularyWord) => word.learned)
                    .sort((a: VocabularyWord, b: VocabularyWord) => 
                        new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime())
                    .slice(0, 100); // Get only the 100 most recently learned
                
                setLearningWords(learning);
                setLearnedWords(learned);
            } catch (error) {
                console.error('Failed to fetch vocabulary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVocabulary();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const renderProficiencyChip = (level: number) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
        
        if (level < 30) color = "error";
        else if (level < 60) color = "warning";
        else if (level < 85) color = "info";
        else color = "success";
        
        return <Chip size="small" label={`${level}%`} color={color} />;
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
            <Typography variant="h4" component="h1" gutterBottom>
                My Vocabulary
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label={`Currently Learning (${learningWords.length})`} />
                    <Tab label={`Recently Learned (${learnedWords.length})`} />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <Paper elevation={2}>
                    <List>
                        {learningWords.length > 0 ? (
                            learningWords.map((word) => (
                                <ListItem key={word.id} divider>
                                    <ListItemText 
                                        primary={word.word} 
                                        secondary={word.translation} 
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {renderProficiencyChip(word.proficiencyLevel)}
                                    </Box>
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No words currently being learned." />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}

            {activeTab === 1 && (
                <Paper elevation={2}>
                    <List>
                        {learnedWords.length > 0 ? (
                            learnedWords.map((word) => (
                                <ListItem key={word.id} divider>
                                    <ListItemText 
                                        primary={word.word} 
                                        secondary={
                                            <>
                                                {word.translation}
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Learned: {new Date(word.lastReviewed).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        } 
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {renderProficiencyChip(word.proficiencyLevel)}
                                    </Box>
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No words have been learned yet." />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}
        </Container>
    );
}