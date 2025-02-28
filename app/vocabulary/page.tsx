'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';

interface VocabularyWord {
    core_index: string;
    expression: string;
    meaning: string;
    last_reviewed_at: string;
    confidence: number;
}

export default function VocabularyPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [addFromCoreNumber, setAddFromCoreNumber] = useState(100);


    const addVocabularyFromCore = async () => {
        try {
            const response = await fetch('/api/vocabulary/add-from-core', {
                method: 'POST',
                body: JSON.stringify({ amount: addFromCoreNumber }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Failed to add vocabulary from core:', error);
        }
    };

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
                console.log(data);
                setWords(data.data);
                console.log(words);
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
                    <Tab label={`Currently Learning (${words.length})`} />
                </Tabs>
            </Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Add More Vocabulary
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* From Core List Section */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            From Core List
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Chip 
                                label="25 Words" 
                                onClick={() => setAddFromCoreNumber(25)}
                                variant={addFromCoreNumber === 25 ? 'filled' : 'outlined'} 
                                color="primary"
                            />
                            <Chip 
                                label="50 Words" 
                                onClick={() => setAddFromCoreNumber(50)}
                                variant={addFromCoreNumber === 50 ? 'filled' : 'outlined'} 
                                color="primary"
                            />
                            <Chip 
                                label="100 Words" 
                                onClick={() => setAddFromCoreNumber(100)}
                                variant={addFromCoreNumber === 100 ? 'filled' : 'outlined'} 
                                color="primary"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip
                                label="Add Core Words"
                                onClick={addVocabularyFromCore}
                                color="primary"
                                sx={{ cursor: 'pointer', px: 2 }}
                            />
                        </Box>
                    </Box>
                    
                    {/* From Categories Section (Separate) */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Add Category Deck
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Chip label="Greetings" onClick={() => {}} variant="outlined" color="secondary" />
                            <Chip label="Food & Drink" onClick={() => {}} variant="outlined" color="secondary" />
                            <Chip label="Travel" onClick={() => {}} variant="outlined" color="secondary" />
                            <Chip label="Business" onClick={() => {}} variant="outlined" color="secondary" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip
                                label="Add Selected Category"
                                onClick={() => {}}
                                color="secondary"
                                sx={{ cursor: 'pointer', px: 2 }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Paper elevation={2}>
                <List>
                    {words.length > 0 ? (
                        words.map((word) => (
                            <ListItem key={word.core_index} divider>
                                <ListItemText 
                                    primary={word.expression} 
                                    secondary={word.meaning} 
                                />
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {renderProficiencyChip(word.confidence)}
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
        </Container>
    );
}