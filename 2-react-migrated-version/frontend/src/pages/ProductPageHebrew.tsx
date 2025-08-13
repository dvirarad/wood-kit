import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Slider,
  Alert,
  CircularProgress,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import backendProductService, { ClientProduct } from '../services/backendProductService';
import { useCart, CartItem } from '../context/CartContext';
import Navigation from '../components/Navigation';

const ProductPageHebrew: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<ClientProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  
  // Configuration state
  const [dimensions, setDimensions] = useState<{ [key: string]: number }>({});
  const [selectedColor, setSelectedColor] = useState<string>('ללא צבע');
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) {
      setError('מזהה מוצר חסר');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const clientProduct = await backendProductService.getClientProduct(productId);
        if (!clientProduct) {
          setError('מוצר לא נמצא');
          setLoading(false);
          return;
        }
        setProduct(clientProduct);
        
        // Initialize dimensions with default values
        const initialDimensions: { [key: string]: number } = {};
        if (clientProduct.customization?.dimensions) {
          Object.entries(clientProduct.customization.dimensions).forEach(([key, config]) => {
            if (config) {
              initialDimensions[key] = config.default;
            }
          });
        }
        setDimensions(initialDimensions);
        setCalculatedPrice(clientProduct.basePrice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) return;

    const calculatePrice = () => {
      try {
        setCalculatingPrice(true);
        const customizations = {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          color: selectedColor
        };
        const totalPrice = backendProductService.calculatePrice(product.productId, customizations);
        setCalculatedPrice(totalPrice);
      } catch (err) {
        console.error('Price calculation failed:', err);
        setCalculatedPrice(product.basePrice);
      } finally {
        setCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [product, dimensions, selectedColor]);

  const handleDimensionChange = (key: string, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      productId: product.productId,
      name: product.name.he,
      basePrice: product.basePrice,
      configuration: {
        dimensions,
        color: selectedColor,
        options: {}
      },
      calculatedPrice,
      quantity
    };

    addItem(cartItem);
    setShowNotification(true);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            טוען מוצר...
          </Typography>
        </Container>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            שגיאה בטעינת המוצר: {error || 'מוצר לא נמצא'}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          חזרה לעמוד הבית
        </Button>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Box
              component="img"
              src={product.images.find(img => img.isPrimary)?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name.he}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                boxShadow: 2
              }}
            />
          </Box>

          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              {product.name.he}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.ratings.average} readOnly size="large" />
              <Typography variant="body1" sx={{ mr: 1 }}>
                ({product.ratings.count} ביקורות)
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              {product.description.he}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label={product.category} variant="outlined" />
            </Box>

            {product.inventory.inStock ? (
              <Chip label="זמין במלאי" color="success" sx={{ mb: 3 }} />
            ) : (
              <Chip label="אזל המלאי" color="error" sx={{ mb: 3 }} />
            )}

            {product.customization?.dimensions && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  התאמה אישית
                </Typography>

                {Object.entries(product.customization.dimensions).map(([key, config]) => {
                  if (!config || !config.visible) return null;
                  
                  return (
                    <Box key={key} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {key === 'height' ? 'גובה' : key === 'width' ? 'רוחב' : key === 'length' ? 'אורך' : key} ({config.min}-{config.max} ס"מ)
                      </Typography>
                      <Slider
                        value={dimensions[key] || config.default}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        disabled={!config.editable}
                        onChange={(_, value) => handleDimensionChange(key, value as number)}
                        valueLabelDisplay="on"
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        נבחר: {dimensions[key] || config.default} ס"מ
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>
            )}

            {product.customization?.colorOptions?.enabled && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  בחירת צבע
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>צבע</InputLabel>
                  <Select
                    value={selectedColor}
                    label="צבע"
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    {product.customization.colorOptions.options.map((color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary">
                  צבע נבחר: <strong>{selectedColor}</strong>
                </Typography>
              </Paper>
            )}

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="h5" color="primary">
                מחיר: ₪{calculatingPrice ? '...' : calculatedPrice.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                כולל מע"ם
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleAddToCart}
              disabled={!product.inventory.inStock || calculatingPrice}
              fullWidth
              sx={{ mb: 2 }}
            >
              {product.inventory.inStock ? 'הוסף לעגלה' : 'אזל המלאי'}
            </Button>
          </Box>
        </Box>
      </Container>
      
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        message="המוצר נוסף לעגלה בהצלחה!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            direction: 'rtl'
          }
        }}
      />
    </>
  );
};

export default ProductPageHebrew;