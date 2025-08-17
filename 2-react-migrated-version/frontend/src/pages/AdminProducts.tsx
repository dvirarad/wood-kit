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
  name?: { he: string }; // Hebrew only
  description?: { he: string }; // Hebrew only
  shortDescription?: { he: string }; // Short description for homepage - Hebrew only
  fullDescription?: { he: string }; // Full description for product page - Hebrew only
  basePrice: number;
  currency: string;
  dimensions: {
    [key: string]: {
      min: number;
      max: number;
      default: number;
      multiplier: number;
      step?: number;
      visible?: boolean;
      editable?: boolean;
    };
  };
  options: {
    [key: string]: {
      available: boolean;
      price: number;
    };
  };
  colorOptions: {
    enabled: boolean;
    priceModifier: number;
    options: Array<{
      name: { en: string; he: string; es: string };
      value: string;
      priceAdjustment: number;
      available: boolean;
    }>;
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
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newImageAlt, setNewImageAlt] = useState<string>('');

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
      // Convert backend format to admin format
      const convertedProducts = allProducts.map(product => ({
        ...product,
        name: typeof product.name === 'string' ? { he: product.name } : 
              product.name?.he ? { he: product.name.he } : { he: '' },
        description: typeof product.description === 'string' ? { he: product.description } : 
                    product.description?.he ? { he: product.description.he } : { he: '' },
        shortDescription: typeof product.shortDescription === 'string' ? { he: product.shortDescription } : 
                         product.shortDescription?.he ? { he: product.shortDescription.he } : { he: '' },
        fullDescription: typeof product.fullDescription === 'string' ? { he: product.fullDescription } : 
                        product.fullDescription?.he ? { he: product.fullDescription.he } : { he: '' }
      }));
      setProducts(convertedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const resetImageForm = () => {
    setNewImageUrl('');
    setNewImageAlt('');
  };

  const handleAddProduct = () => {
    const newProduct: AdminProduct = {
      productId: '',
      name: { he: '' }, // Initialize name - Hebrew only
      description: { he: '' }, // Initialize description - Hebrew only
      shortDescription: { he: '' }, // Initialize short description - Hebrew only
      fullDescription: { he: '' }, // Initialize full description - Hebrew only
      basePrice: 0,
      currency: 'NIS',
      dimensions: {
        width: { min: 10, max: 300, default: 50, multiplier: 1.0, step: 5, visible: true, editable: true },
        height: { min: 10, max: 300, default: 100, multiplier: 1.0, step: 5, visible: true, editable: true },
        depth: { min: 10, max: 300, default: 30, multiplier: 1.0, step: 1, visible: true, editable: true },
        shelves: { min: 1, max: 10, default: 3, multiplier: 50, step: 1, visible: true, editable: true }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: false, price: 0 }
      },
      colorOptions: {
        enabled: true,
        priceModifier: 0.4,
        options: [
          {
            name: { en: 'Natural', he: 'טבעי', es: 'Natural' },
            value: 'natural',
            priceAdjustment: 0,
            available: true
          },
          {
            name: { en: 'Walnut', he: 'אגוז', es: 'Nogal' },
            value: 'walnut',
            priceAdjustment: 50,
            available: true
          }
        ]
      },
      category: '',
      tags: [],
      images: [],
      inventory: { inStock: true, stockLevel: 0, lowStockThreshold: 5 }
    };
    setEditingProduct(newProduct);
    resetImageForm();
    setDialogOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    // Ensure all text fields have proper Hebrew structure
    const editableProduct = {
      ...product,
      name: product.name?.he ? { he: product.name.he } : { he: '' },
      description: product.description?.he ? { he: product.description.he } : { he: '' },
      shortDescription: product.shortDescription?.he ? { he: product.shortDescription.he } : { he: '' },
      fullDescription: product.fullDescription?.he ? { he: product.fullDescription.he } : { he: '' }
    };
    setEditingProduct(editableProduct);
    resetImageForm();
    setDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    // Validate required Hebrew fields
    if (!editingProduct.name?.he) {
      alert('נדרש שם בעברית');
      return;
    }
    
    if (!editingProduct.description?.he) {
      alert('נדרש תיאור בעברית');
      return;
    }
    
    if (!editingProduct.shortDescription?.he) {
      alert('נדרש תיאור קצר בעברית');
      return;
    }
    
    if (!editingProduct.fullDescription?.he) {
      alert('נדרש תיאור מלא בעברית');
      return;
    }
    
    try {
      // Prepare data for backend - convert Hebrew-only format to backend format
      const backendData = {
        ...editingProduct,
        name: editingProduct.name?.he || '',
        description: editingProduct.description?.he || '',
        shortDescription: editingProduct.shortDescription?.he || '',
        fullDescription: editingProduct.fullDescription?.he || ''
      };
      
      if (editingProduct.id) {
        // Update existing product
        await backendProductService.updateProduct(editingProduct.id, backendData);
      } else {
        // Add new product
        await backendProductService.addProduct(backendData);
      }
      
      setDialogOpen(false);
      setEditingProduct(null);
      resetImageForm();
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


  const handleAddImageUrl = () => {
    if (!editingProduct || !newImageUrl.trim()) return;

    const newImage = {
      url: newImageUrl.trim(),
      alt: newImageAlt.trim() || 'תמונת מוצר',
      isPrimary: editingProduct.images.length === 0 // First image is primary by default
    };
    
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, newImage]
    });
    
    // Clear the input fields
    setNewImageUrl('');
    setNewImageAlt('');
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

  const handleRemoveAllImages = () => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      images: []
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

  const updateDimension = (dimension: 'width' | 'height' | 'depth' | 'shelves', field: string, value: any) => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      dimensions: {
        ...editingProduct.dimensions,
        [dimension]: {
          ...(editingProduct.dimensions?.[dimension] || {}),
          [field]: value
        }
      }
    });
  };

  const updateColorOptions = (field: string, value: any) => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      colorOptions: {
        ...editingProduct.colorOptions,
        [field]: value
      }
    });
  };

  const addColorOption = () => {
    if (!editingProduct) return;
    
    const newColor = {
      name: { he: '', en: '', es: '' },
      value: '',
      priceAdjustment: 0,
      available: true
    };
    
    setEditingProduct({
      ...editingProduct,
      colorOptions: {
        ...editingProduct.colorOptions,
        options: [...(editingProduct.colorOptions?.options || []), newColor]
      }
    });
  };

  const updateColorOption = (index: number, field: string, value: any) => {
    if (!editingProduct || !editingProduct.colorOptions) return;
    
    const updatedOptions = [...editingProduct.colorOptions.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    
    setEditingProduct({
      ...editingProduct,
      colorOptions: {
        ...editingProduct.colorOptions,
        options: updatedOptions
      }
    });
  };

  const removeColorOption = (index: number) => {
    if (!editingProduct || !editingProduct.colorOptions) return;
    
    const updatedOptions = editingProduct.colorOptions.options.filter((_, i) => i !== index);
    
    setEditingProduct({
      ...editingProduct,
      colorOptions: {
        ...editingProduct.colorOptions,
        options: updatedOptions
      }
    });
  };

  const calculateExamplePrice = (product: AdminProduct): number => {
    const { width, height, depth, shelves } = product.dimensions || {};
    const widthCost = width ? (width.default - width.min) * width.multiplier : 0;
    const heightCost = height ? (height.default - height.min) * height.multiplier : 0;
    const depthCost = depth ? (depth.default - depth.min) * depth.multiplier : 0;
    const shelvesCost = shelves ? (shelves.default - shelves.min) * shelves.multiplier : 0;
    
    let totalPrice = product.basePrice + widthCost + heightCost + depthCost + shelvesCost;
    
    // Add color cost (40% increase) for example calculation - simplified for now
    totalPrice += totalPrice * 0.4;
    
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
                  <TableCell>{product.name?.he || product.productId}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₪{product.basePrice}</TableCell>
                  <TableCell>₪{Math.round(calculateExamplePrice(product))}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.inventory.inStock ? `${product.inventory.stockLevel} יחידות` : 'אזל המלאי'}
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
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          fullWidth
                          label="שם המוצר"
                          value={editingProduct.name?.he || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            name: { he: e.target.value }
                          })}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="תיאור"
                          value={editingProduct.description?.he || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            description: { he: e.target.value }
                          })}
                        />
                      </Box>
                      
                      {/* Short Description Fields */}
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>תיאור קצר (יוצג בעמוד הבית)</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="תיאור קצר"
                          value={editingProduct.shortDescription?.he || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            shortDescription: { he: e.target.value }
                          })}
                        />
                      </Box>

                      {/* Full Description Fields */}
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>תיאור מלא (יוצג בעמוד המוצר)</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="תיאור מלא"
                          value={editingProduct.fullDescription?.he || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            fullDescription: { he: e.target.value }
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
                            <MenuItem value="furniture">רהיטים</MenuItem>
                            <MenuItem value="outdoor">גן</MenuItem>
                            <MenuItem value="bookshelf">ספרייה</MenuItem>
                            <MenuItem value="stairs">מדרגות</MenuItem>
                            <MenuItem value="pet">חיות מחמד</MenuItem>
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
                          value={editingProduct.inventory.stockLevel}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            inventory: { ...editingProduct.inventory, stockLevel: Number(e.target.value) }
                          })}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Dimensions Configuration */}
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>הגדרות ממדים</Typography>
                    {(['width', 'height', 'depth', 'shelves'] as const).map((dimension) => (
                      <Card key={dimension} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {dimension === 'width' ? 'רוחב' : dimension === 'height' ? 'גובה' : dimension === 'depth' ? 'עומק' : 'כמות מדפים'} {dimension === 'shelves' ? '(יחידות)' : '(ס"מ)'}
                          </Typography>
                          
                          {/* Dimension Values */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                            <TextField
                              size="small"
                              type="number"
                              label="מינימום"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions?.[dimension]?.min || 0}
                              onChange={(e) => updateDimension(dimension, 'min', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="מקסימום"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions?.[dimension]?.max || 0}
                              onChange={(e) => updateDimension(dimension, 'max', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="ברירת מחדל"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions?.[dimension]?.default || 0}
                              onChange={(e) => updateDimension(dimension, 'default', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="מחיר לס&quot;מ"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions?.[dimension]?.multiplier || 0}
                              onChange={(e) => updateDimension(dimension, 'multiplier', Number(e.target.value))}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="צעדים (ס&quot;מ)"
                              sx={{ flex: '1 1 120px' }}
                              value={editingProduct.dimensions?.[dimension]?.step || 1}
                              onChange={(e) => updateDimension(dimension, 'step', Number(e.target.value))}
                              inputProps={{ min: 0.1, step: 0.1 }}
                            />
                          </Box>
                          
                          {/* Dimension Control Settings */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editingProduct.dimensions?.[dimension]?.visible !== false}
                                  onChange={(e) => updateDimension(dimension, 'visible', e.target.checked)}
                                  size="small"
                                />
                              }
                              label="נראה ללקוח"
                              sx={{ minWidth: '120px' }}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editingProduct.dimensions?.[dimension]?.editable !== false}
                                  onChange={(e) => updateDimension(dimension, 'editable', e.target.checked)}
                                  size="small"
                                />
                              }
                              label="ניתן לעריכה"
                              sx={{ minWidth: '120px' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>


                  {/* Price Preview */}
                  <Box>
                    <Alert severity="info">
                      <Typography variant="subtitle2">
                        תצוגה מקדימה של מחיר: ₪{Math.round(calculateExamplePrice(editingProduct))}
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
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          label="קישור לתמונה (URL)"
                          placeholder="https://example.com/image.jpg"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="טקסט חלופי"
                          placeholder="תיאור התמונה"
                          value={newImageAlt}
                          onChange={(e) => setNewImageAlt(e.target.value)}
                          sx={{ width: '200px' }}
                        />
                        <Button 
                          variant="contained" 
                          startIcon={<PhotoIcon />}
                          onClick={handleAddImageUrl}
                          disabled={!newImageUrl.trim()}
                          sx={{ minWidth: '120px' }}
                        >
                          הוסף תמונה
                        </Button>
                        {editingProduct.images.length > 0 && (
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={handleRemoveAllImages}
                            sx={{ minWidth: '120px' }}
                          >
                            מחק הכל
                          </Button>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        הזן קישור לתמונה מהאינטרנט. ניתן להוסיף מספר תמונות. התמונה הראשונה תהיה התמונה הראשית.
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
