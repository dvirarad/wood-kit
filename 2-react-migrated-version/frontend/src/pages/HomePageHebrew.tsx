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
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { Category as CategoryIcon, Build, AutoAwesome, CheckCircle, Timer, EmojiObjects } from '@mui/icons-material';
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
      
      {/* Hero Section - First as requested */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          ברוכים הבאים ל-Wood Kits
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={2}>
          מוצרי עץ מותאמים אישית לבית שלכם
        </Typography>
        <Chip 
          label="🛠️ קיטי DIY קלים להרכבה"
          color="primary" 
          variant="filled"
          sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 1, px: 2 }}
        />
      </Box>

      {/* Products Section - Second as requested */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        המוצרים שלנו
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
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
                  {product.shortDescription?.he || product.description.he}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={product.ratings.average} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({product.ratings.count} ביקורות)
                  </Typography>
                </Box>

                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  החל מ-₪{product.minimumPrice || product.basePrice}
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
        <Box textAlign="center" sx={{ py: 4, mb: 6 }}>
          <Typography variant="h6" color="text.secondary">
            אין מוצרים להצגה כרגע
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* DIY Experience Showcase */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Build sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            חוויית DIY מהנה ומקצועית
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%', boxShadow: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', height: 250 }}>
                <CardMedia
                  component="img"
                  height="250"
                  image="/images/diy/assembly-process.png"
                  alt="תהליך הרכבה קל ומהנה"
                  sx={{ 
                    objectFit: 'cover',
                    filter: 'brightness(1.1) contrast(1.05)'
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Timer sx={{ color: 'success.main', fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    הרכבה ב-30-60 דקות
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  הדרכה ברורה עם איורים מפורטים וכלים פשוטים. תהליך נעים ומהנה לכל המשפחה.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%', boxShadow: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', height: 250 }}>
                <CardMedia
                  component="img"
                  height="250"
                  image="/images/diy/finished-product.png"
                  alt="התוצאה הסופית - רהיט מעוצב ואיכותי"
                  sx={{ 
                    objectFit: 'cover',
                    filter: 'brightness(1.1) contrast(1.05)'
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoAwesome sx={{ color: 'warning.main', fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    תוצאה מקצועית מבית
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  חווה את הסיפוק של יצירה עצמית והשג רהיט איכותי ומותאם אישית לחלל שלך.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          <Chip 
            icon={<CheckCircle />} 
            label="כל החומרים כלולים" 
            color="success" 
            variant="filled"
            sx={{ fontSize: '1rem' }}
          />
          <Chip 
            icon={<EmojiObjects />} 
            label="הוראות הרכבה ברורות" 
            color="primary" 
            variant="filled"
            sx={{ fontSize: '1rem' }}
          />
          <Chip 
            icon={<Build />} 
            label="כלים בסיסיים בלבד" 
            color="info" 
            variant="filled"
            sx={{ fontSize: '1rem' }}
          />
        </Box>
      </Paper>

      {/* Why Choose Our DIY Kits */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" align="center" fontWeight="bold" mb={2}>
          למה לבחור ברהיטי DIY שלנו?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" mb={4}>
          חוויית בנייה מהנה עם תוצאות מקצועיות
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3 }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <EmojiObjects sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                הוראות הרכבה ברורות
              </Typography>
              <Typography variant="body2" color="text.secondary">
                איורים מפורטים, הוראות פשוטות ורשימת כלים. בדיוק כמו שאתם אוהבים, אבל עם התאמה אישית מלאה לבית שלכם.
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3 }}>
              <Box sx={{ 
                bgcolor: 'success.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                איכות מובטחת
              </Typography>
              <Typography variant="body2" color="text.secondary">
                עץ איכותי, חומרי חיזוק מקצועיים וחלקי מתכת עמידים. כל קיט עובר בדיקת איכות לפני המשלוח.
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3 }}>
              <Box sx={{ 
                bgcolor: 'warning.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <AutoAwesome sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                סיפוק אישי
              </Typography>
              <Typography variant="body2" color="text.secondary">
                אין כמו הרגש של "עשיתי את זה בעצמי!" - תיהנו מתהליך הבנייה ותקבלו רהיט שיש לו סיפור.
              </Typography>
            </Paper>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            <strong>זמן הרכבה משוער:</strong> 30-60 דקות | <strong>כלים נדרשים:</strong> מברגה חשמלית, פלס | <strong>מתאים לכל הגילאים:</strong> פרויקט משפחתי מהנה
          </Typography>
        </Box>
      </Box>

      </Container>
    </>
  );
};

export default HomePageHebrew;