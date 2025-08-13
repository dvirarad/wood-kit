import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

const SimpleHome: React.FC = () => {
  console.log('SimpleHome component is being rendered');
  
  const [status, setStatus] = useState('Starting...');
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('Current state - status:', status, 'error:', error, 'apiResult:', apiResult);

  useEffect(() => {
    console.log('=== useEffect is running ===');
    console.log('SimpleHome component mounted');
    setStatus('Component mounted, making API call...');
    console.log('Status updated to: Component mounted, making API call...');
    
    // Simple fetch without any services
    console.log('About to make fetch request to backend...');
    fetch('http://localhost:6003/api/v1/products?language=he&limit=3')
      .then(response => {
        console.log('===== API RESPONSE RECEIVED =====');
        console.log('API response status:', response.status);
        console.log('API response ok:', response.ok);
        setStatus(`API responded with status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('===== API DATA PARSED =====');
        console.log('API data:', data);
        setApiResult(data);
        setStatus('API call successful!');
        console.log('State updated with API data');
      })
      .catch(err => {
        console.error('===== API CALL FAILED =====');
        console.error('API call failed:', err);
        console.error('Error type:', typeof err);
        console.error('Error message:', err.message);
        setError(err.message);
        setStatus('API call failed');
      });
  }, []);

  console.log('About to render with status:', status);

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl', textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        ברוכים הבאים ל-Wood Kits
      </Typography>
      
      <Box sx={{ my: 4, border: '2px solid red', padding: 2, backgroundColor: 'yellow' }}>
        <Typography variant="h6" color="black">Status: {status}</Typography>
        <Typography variant="body2" color="black">Error: {error || 'None'}</Typography>
        <Typography variant="body2" color="black">API Result: {apiResult ? 'Has data' : 'No data'}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {apiResult && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Products Found: {apiResult.data?.length || 0}
          </Typography>
          {apiResult.data && apiResult.data.map((product: any, index: number) => (
            <Box key={product.id} sx={{ 
              border: '1px solid #ccc', 
              margin: 2, 
              padding: 2, 
              borderRadius: 1 
            }}>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2">{product.description}</Typography>
              <Typography variant="h6" color="primary">
                ₪{product.basePrice}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SimpleHome;