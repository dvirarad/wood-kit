import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import backendProductService, { ClientProduct } from '../services/backendProductService';
import Navigation from '../components/Navigation';

const HomePageHebrew: React.FC = () => {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const clientProducts = await backendProductService.getClientProducts({ 
          language: 'he',
          limit: 6 
        });
        setProducts(clientProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת המוצרים');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to product changes
    const unsubscribe = backendProductService.subscribe(() => {
      fetchProducts();
    });

    return unsubscribe;
  }, []);

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען מוצרים...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          שגיאה בטעינת המוצרים: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          ברוכים הבאים ל-Wood Kits
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={4}>
          מוצרי עץ מותאמים אישית לבית שלכם
        </Typography>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        המוצרים שלנו
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {products.map((product) => {
          // Debug logging
          console.log('Rendering product:', product);
          
          if (!product || !product.name || !product.name.he) {
            console.error('Invalid product data:', product);
            return null; // Skip invalid products
          }
          
          return (
          <Box key={product.id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {product.images && product.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="240"
                  image={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                  alt={product.name.he}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 240, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 80 }} />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  {product.name.he}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description.he}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={product.ratings.average} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({product.ratings.count} ביקורות)
                  </Typography>
                </Box>

                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  החל מ-₪{product.basePrice}
                </Typography>

                <Chip 
                  label={product.category} 
                  size="small" 
                  variant="outlined" 
                  sx={{ mb: 1 }}
                />

                {product.inventory.inStock ? (
                  <Chip 
                    label="זמין במלאי" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                ) : (
                  <Chip 
                    label="אזל המלאי" 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                  />
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => handleViewProduct(product.productId)}
                  disabled={!product.inventory.inStock}
                  fullWidth
                >
                  {product.inventory.inStock ? 'צפה במוצר' : 'אזל המלאי'}
                </Button>
              </CardActions>
            </Card>
          </Box>
          );
        }).filter(Boolean)}
      </Box>

      {products.length === 0 && (
        <Box textAlign="center" sx={{ py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            אין מוצרים להצגה כרגע
          </Typography>
        </Box>
      )}
      </Container>
    </>
  );
};

export default HomePageHebrew;