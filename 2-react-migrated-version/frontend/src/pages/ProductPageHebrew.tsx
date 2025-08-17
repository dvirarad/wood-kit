import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import backendProductService, { ClientProduct } from '../services/backendProductService';
import { useCart, CartItem } from '../context/CartContext';
import Navigation from '../components/Navigation';
import ReviewSystem from '../components/ReviewSystem';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  // Order form state
  const [orderDialogOpen, setOrderDialogOpen] = useState<boolean>(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryMethod: 'pickup' // 'pickup' or 'shipping'
  });
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);

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

  // Debounce dimensions and color changes to reduce API calls
  const debouncedDimensions = useDebounce(dimensions, 800); // 800ms delay
  const debouncedSelectedColor = useDebounce(selectedColor, 500); // 500ms delay

  useEffect(() => {
    if (!product) return;

    const calculatePrice = async () => {
      try {
        setCalculatingPrice(true);
        const customizations = {
          length: debouncedDimensions.length,
          width: debouncedDimensions.width,
          height: debouncedDimensions.height,
          depth: debouncedDimensions.depth,
          steps: debouncedDimensions.steps,
          color: debouncedSelectedColor
        };
        const totalPrice = await backendProductService.calculatePrice(product.productId, customizations);
        setCalculatedPrice(totalPrice);
      } catch (err) {
        console.error('Price calculation failed:', err);
        setCalculatedPrice(product.basePrice);
      } finally {
        setCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [product, debouncedDimensions, debouncedSelectedColor]);

  const handleDimensionChange = (key: string, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const handleOrderClick = () => {
    setOrderDialogOpen(true);
  };

  const handleOrderSubmit = async () => {
    if (!product) return;
    
    setOrderSubmitting(true);
    try {
      // Calculate final price including delivery
      const deliveryFee = orderForm.deliveryMethod === 'shipping' ? 400 : 0;
      const finalPrice = calculatedPrice + deliveryFee;
      
      const orderData = {
        // Product details
        productId: product.productId,
        productName: product.name.he,
        basePrice: product.basePrice,
        configuration: {
          dimensions,
          color: selectedColor
        },
        calculatedPrice: calculatedPrice,
        deliveryFee: deliveryFee,
        finalPrice: finalPrice,
        
        // Customer details
        customer: orderForm,
        
        // Order metadata
        orderDate: new Date().toISOString(),
        language: 'he'
      };
      
      // Send to backend API
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit order');
      }

      console.log('Order submitted successfully:', result.data);
      
      // Close dialog and show success
      setOrderDialogOpen(false);
      setShowNotification(true);
      
      // Reset form
      setOrderForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryMethod: 'pickup'
      });
      
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
    } finally {
      setOrderSubmitting(false);
    }
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
            {/* Main Image Display */}
            <Box
              component="img"
              src={product.images[selectedImageIndex]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name.he}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                boxShadow: 2,
                mb: 2
              }}
            />
            
            {/* Image Gallery Thumbnails */}
            {product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image.url}
                    alt={`${product.name.he} ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: 80,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '3px solid' : '1px solid',
                      borderColor: selectedImageIndex === index ? 'primary.main' : 'grey.300',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Box sx={{ mb: 3 }}>
              <Chip 
                label="🛠️ קיט DIY"
                color="primary" 
                variant="filled"
                sx={{ mb: 2, fontWeight: 'bold' }}
              />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {product.name.he}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                רהיט מותאם אישית לבנייה עצמית
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.ratings.average} readOnly size="large" />
              <Typography variant="body1" sx={{ mr: 1 }}>
                ({product.ratings.count} ביקורות)
              </Typography>
              <Chip 
                label="משלוח מהיר" 
                size="small" 
                color="success" 
                sx={{ mr: 1 }}
              />
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
                        {key === 'height' ? 'גובה' : key === 'width' ? 'רוחב' : key === 'length' ? 'אורך' : key === 'depth' ? 'עומק' : key} ({config.min}-{config.max} ס"מ)
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
              onClick={handleOrderClick}
              disabled={!product.inventory.inStock || calculatingPrice}
              fullWidth
              sx={{ 
                mb: 2,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1A9CD8 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {product.inventory.inStock ? '🛠️ המשך להזמנה - בנה את הרהיט שלך!' : 'אזל המלאי'}
            </Button>
          </Box>
        </Box>

        {/* Review System */}
        <ReviewSystem 
          productId={product.productId} 
          productName={product.name.he} 
        />
      </Container>
      
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        message="ההזמנה נשלחה בהצלחה! נחזור אליך בהקדם."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            direction: 'rtl'
          }
        }}
      />

      {/* Order Form Dialog */}
      <Dialog 
        open={orderDialogOpen} 
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ direction: 'rtl' }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            המשך להזמנה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product?.name.he} - ₪{calculatedPrice.toLocaleString()}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Customer Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                פרטים אישיים
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="שם מלא"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                  dir="rtl"
                />
                <TextField
                  required
                  fullWidth
                  label="כתובת אימייל"
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                  dir="ltr"
                />
                <TextField
                  required
                  fullWidth
                  label="מספר טלפון"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  dir="ltr"
                />
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={3}
                  label="כתובת מלאה"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                  dir="rtl"
                />
              </Box>
            </Box>

            <Divider />

            {/* Delivery Method */}
            <Box>
              <Typography variant="h6" gutterBottom>
                שיטת משלוח
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={orderForm.deliveryMethod}
                  onChange={(e) => setOrderForm({...orderForm, deliveryMethod: e.target.value})}
                >
                  <FormControlLabel
                    value="pickup"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">איסוף עצמי</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ללא עלות נוספת
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="shipping"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">משלוח עד הבית</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₪400 (משלוח בלבד)
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            <Divider />

            {/* Price Summary */}
            <Box>
              <Typography variant="h6" gutterBottom>
                סיכום מחיר
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>מחיר המוצר:</Typography>
                <Typography>₪{calculatedPrice.toLocaleString()}</Typography>
              </Box>
              {orderForm.deliveryMethod === 'shipping' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>משלוח:</Typography>
                  <Typography>₪400</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="h6">סה"כ לתשלום:</Typography>
                <Typography variant="h6" color="primary">
                  ₪{(calculatedPrice + (orderForm.deliveryMethod === 'shipping' ? 400 : 0)).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOrderDialogOpen(false)}
            variant="outlined"
            fullWidth
          >
            ביטול
          </Button>
          <Button 
            onClick={handleOrderSubmit}
            variant="contained"
            fullWidth
            disabled={orderSubmitting || !orderForm.name || !orderForm.email || !orderForm.phone || !orderForm.address}
          >
            {orderSubmitting ? 'שולח...' : 'שלח הזמנה'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductPageHebrew;