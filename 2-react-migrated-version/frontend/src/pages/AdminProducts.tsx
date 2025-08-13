import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import backendProductService from '../services/backendProductService';

// Admin product interface for backend API
interface AdminProduct {
  id?: string;
  productId: string;
  basePrice: number;
  currency: string;
  dimensions: {
    [key: string]: {
      min: number;
      max: number;
      default: number;
      multiplier: number;
    };
  };
  options: {
    [key: string]: {
      available: boolean;
      price: number;
    };
  };
  category: string;
  tags: string[];
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  inventory: {
    inStock: boolean;
    stockLevel: number;
    lowStockThreshold: number;
  };
}

// Use the shared ManagedProduct interface from productManagerService

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadProducts();
    }
  }, [navigate]);

  useEffect(() => {
    // Subscribe to product changes
    const unsubscribe = backendProductService.subscribe(() => {
      loadProducts();
    });

    return unsubscribe;
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await backendProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddProduct = () => {
    const newProduct: AdminProduct = {
      productId: '',
      basePrice: 0,
      currency: 'NIS',
      dimensions: {
        length: { min: 10, max: 300, default: 100, multiplier: 1.0 },
        width: { min: 10, max: 300, default: 50, multiplier: 1.0 },
        height: { min: 10, max: 300, default: 100, multiplier: 1.0 }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: false, price: 0 }
      },
      category: '',
      tags: [],
      images: [],
      inventory: { inStock: true, stockLevel: 0, lowStockThreshold: 5 }
    };
    setEditingProduct(newProduct);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct({ ...product });
    setDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    try {
      if (editingProduct.id) {
        // Update existing product
        await backendProductService.updateProduct(editingProduct.id, editingProduct);
      } else {
        // Add new product
        await backendProductService.addProduct(editingProduct);
      }
      
      setDialogOpen(false);
      setEditingProduct(null);
      loadProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await backendProductService.deleteProduct(productId);
      loadProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingProduct) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage = {
          url: imageUrl,
          isPrimary: editingProduct.images.length === 0 // First image is primary by default
        };
        
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, newImage]
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (imageIndex: number) => {
    if (!editingProduct) return;
    
    const updatedImages = editingProduct.images.filter((_, index) => index !== imageIndex);
    
    // If we deleted the primary image, make the first remaining image primary
    if (updatedImages.length > 0 && editingProduct.images[imageIndex].isPrimary) {
      updatedImages[0].isPrimary = true;
    }
    
    setEditingProduct({
      ...editingProduct,
      images: updatedImages
    });
  };

  const handleSetPrimaryImage = (imageIndex: number) => {
    if (!editingProduct) return;
    
    const updatedImages = editingProduct.images.map((image, index) => ({
      ...image,
      isPrimary: index === imageIndex
    }));
    
    setEditingProduct({
      ...editingProduct,
      images: updatedImages
    });
  };

  const updateDimension = (dimension: 'length' | 'width' | 'height', field: string, value: any) => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      dimensions: {
        ...editingProduct.dimensions,
        [dimension]: {
          ...editingProduct.dimensions[dimension],
          [field]: value
        }
      }
    });
  };

  const calculateExamplePrice = (product: ManagedProduct): number => {
    const { length, width, height } = product.dimensions;
    const lengthCost = (length.default - length.min) * length.priceModifier;
    const widthCost = (width.default - width.min) * width.priceModifier;
    const heightCost = (height.default - height.min) * height.priceModifier;
    
    let totalPrice = product.basePrice + lengthCost + widthCost + heightCost;
    
    // Add color cost (40% increase) for example calculation
    if (product.colorOptions?.enabled) {
      totalPrice += totalPrice * product.colorOptions.priceModifier;
    }
    
    return totalPrice;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4, direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1">
            ניהול מוצרים
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            size="large"
          >
            הוסף מוצר חדש
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם המוצר</TableCell>
                <TableCell>קטגוריה</TableCell>
                <TableCell>מחיר בסיס</TableCell>
                <TableCell>מחיר דוגמה</TableCell>
                <TableCell>מלאי</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name.he}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₪{product.basePrice}</TableCell>
                  <TableCell>₪{calculateExamplePrice(product).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.inventory.inStock ? `${product.inventory.quantity} יחידות` : 'אזל המלאי'}
                      color={product.inventory.inStock ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditProduct(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteProduct(product.id!)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editingProduct?.id ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
          </DialogTitle>
          <DialogContent>
            {editingProduct && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="h6" gutterBottom>פרטים בסיסיים</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="שם המוצר (עברית)"
                          value={editingProduct.name.he}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            name: { ...editingProduct.name, he: e.target.value }
                          })}
                        />
                        <TextField
                          fullWidth
                          label="שם המוצר (אנגלית)"
                          value={editingProduct.name.en}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            name: { ...editingProduct.name, en: e.target.value }
                          })}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="תיאור (עברית)"
                          value={editingProduct.description.he}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            description: { ...editingProduct.description, he: e.target.value }
                          })}
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="תיאור (אנגלית)"
                          value={editingProduct.description.en}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            description: { ...editingProduct.description, en: e.target.value }
                          })}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl sx={{ flex: 1 }}>
                          <InputLabel>קטגוריה</InputLabel>
                          <Select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({
                              ...editingProduct,
                              category: e.target.value
                            })}
                          >
                            <MenuItem value="רהיטים">רהיטים</MenuItem>
                            <MenuItem value="גן">גן</MenuItem>
                            <MenuItem value="אחסון">אחסון</MenuItem>
                            <MenuItem value="דקורציה">דקורציה</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          sx={{ flex: 1 }}
                          type="number"
                          label="מחיר בסיס (₪)"
                          value={editingProduct.basePrice}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            basePrice: Number(e.target.value)
                          })}
                        />
                        <TextField
                          sx={{ flex: 1 }}
                          type="number"
                          label="כמות במלאי"
                          value={editingProduct.inventory.quantity}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            inventory: { ...editingProduct.inventory, quantity: Number(e.target.value) }
                          })}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Dimensions Configuration */}
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>הגדרות ממדים</Typography>
                    {(['length', 'width', 'height'] as const).map((dimension) => (
                      <Card key={dimension} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {dimension === 'length' ? 'אורך' : dimension === 'width' ? 'רוחב' : 'גובה'} (ס"מ)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                              size="small"
                              type="number"
                              label="מינימום"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions[dimension].min}
                              onChange={(e) => updateDimension(dimension, 'min', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="מקסימום"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions[dimension].max}
                              onChange={(e) => updateDimension(dimension, 'max', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="ברירת מחדל"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions[dimension].default}
                              onChange={(e) => updateDimension(dimension, 'default', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="צעדים"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions[dimension].step}
                              onChange={(e) => updateDimension(dimension, 'step', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="מחיר לס&quot;מ"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions[dimension].priceModifier}
                              onChange={(e) => updateDimension(dimension, 'priceModifier', Number(e.target.value))}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={editingProduct.dimensions[dimension].visible}
                                    onChange={(e) => updateDimension(dimension, 'visible', e.target.checked)}
                                  />
                                }
                                label="נראה"
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={editingProduct.dimensions[dimension].editable}
                                    onChange={(e) => updateDimension(dimension, 'editable', e.target.checked)}
                                  />
                                }
                                label="ניתן לעריכה"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  {/* Color Options Configuration */}
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>אפשרויות צבע</Typography>
                    
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={editingProduct.colorOptions?.enabled || false}
                                onChange={(e) => setEditingProduct({
                                  ...editingProduct,
                                  colorOptions: {
                                    enabled: e.target.checked,
                                    priceModifier: editingProduct.colorOptions?.priceModifier || 0.4,
                                    options: editingProduct.colorOptions?.options || ['ללא צבע', 'דובדבן', 'אגוז', 'לבן', 'שחור', 'אלון', 'מייפל', 'ירוק', 'אפור']
                                  }
                                })}
                              />
                            }
                            label="אפשר בחירת צבע"
                          />
                          
                          {editingProduct.colorOptions?.enabled && (
                            <TextField
                              size="small"
                              type="number"
                              label="אחוז תוספת מחיר (0.4 = 40%)"
                              sx={{ flex: '1 1 200px' }}
                              value={editingProduct.colorOptions.priceModifier}
                              onChange={(e) => setEditingProduct({
                                ...editingProduct,
                                colorOptions: {
                                  ...editingProduct.colorOptions!,
                                  priceModifier: Number(e.target.value)
                                }
                              })}
                              inputProps={{ step: 0.1, min: 0, max: 1 }}
                            />
                          )}
                        </Box>
                        
                        {editingProduct.colorOptions?.enabled && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              אפשרויות צבע זמינות:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {editingProduct.colorOptions.options.map((color, index) => (
                                <Chip 
                                  key={index}
                                  label={color}
                                  variant="outlined"
                                  color={color === 'ללא צבע' ? 'default' : 'primary'}
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              הצבעים הזמינים: ללא צבע, דובדבן, אגוז, לבן, שחור, אלון, מייפל, ירוק, אפור
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Price Preview */}
                  <Box>
                    <Alert severity="info">
                      <Typography variant="subtitle2">
                        תצוגה מקדימה של מחיר: ₪{calculateExamplePrice(editingProduct).toFixed(2)}
                      </Typography>
                      <Typography variant="caption">
                        (מבוסס על ממדי ברירת המחדל)
                      </Typography>
                    </Alert>
                  </Box>

                  {/* Images Section */}
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>תמונות מוצר</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        multiple
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="image-upload">
                        <Button 
                          variant="outlined" 
                          component="span"
                          startIcon={<PhotoIcon />}
                          sx={{ mb: 2 }}
                        >
                          העלה תמונות
                        </Button>
                      </label>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ניתן לבחור מספר תמונות בו זמנית. התמונה הראשונה תהיה התמונה הראשית.
                      </Typography>
                    </Box>

                    {/* Image Gallery */}
                    {editingProduct.images.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          תמונות ({editingProduct.images.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {editingProduct.images.map((image, index) => (
                            <Box key={index} sx={{ flex: '0 1 200px' }}>
                              <Card sx={{ position: 'relative' }}>
                                <Box
                                  component="img"
                                  sx={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                  }}
                                  src={image.url}
                                  alt={`תמונה ${index + 1}`}
                                />
                                
                                {/* Primary Star Badge */}
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  right: 8,
                                  backgroundColor: image.isPrimary ? 'primary.main' : 'transparent',
                                  borderRadius: '50%',
                                  p: 0.5
                                }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSetPrimaryImage(index)}
                                    sx={{ 
                                      color: image.isPrimary ? 'white' : 'grey.600',
                                      '&:hover': { color: 'primary.main' }
                                    }}
                                  >
                                    {image.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                                  </IconButton>
                                </Box>

                                {/* Delete Button */}
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  left: 8,
                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                  borderRadius: '50%',
                                  p: 0.5
                                }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteImage(index)}
                                    sx={{ 
                                      color: 'white',
                                      '&:hover': { color: 'error.main' }
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Box>

                                {/* Primary Label */}
                                {image.isPrimary && (
                                  <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    textAlign: 'center',
                                    py: 0.5
                                  }}>
                                    <Typography variant="caption">
                                      תמונה ראשית
                                    </Typography>
                                  </Box>
                                )}
                              </Card>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {editingProduct.images.length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          לא הועלו תמונות עדיין. השתמש בכפתור "העלה תמונות" כדי להוסיף תמונות למוצר.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} startIcon={<CancelIcon />}>
              ביטול
            </Button>
            <Button onClick={handleSaveProduct} variant="contained" startIcon={<SaveIcon />}>
              שמור
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminProducts;
