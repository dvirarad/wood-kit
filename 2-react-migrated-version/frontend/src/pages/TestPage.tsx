import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Alert } from '@mui/material';

const TestPage: React.FC = () => {
  const [apiData, setApiData] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connection...');
        const response = await fetch('http://localhost:6003/api/v1/products?language=he&limit=2');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API data received:', data);
        
        if (data.success && data.data.length > 0) {
          setApiData(`Success! Got ${data.data.length} products. First product: ${data.data[0].name}`);
        } else {
          setApiData('API responded but no products found');
        }
      } catch (err) {
        console.error('API test failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setApiData('Failed to load');
      }
    };

    testAPI();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        API Connection Test
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Status: {apiData}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        sx={{ mr: 2 }}
      >
        Reload Test
      </Button>
      
      <Button
        variant="outlined"
        onClick={() => console.log('Console test - if you see this, console is working')}
      >
        Test Console
      </Button>
    </Container>
  );
};

export default TestPage;