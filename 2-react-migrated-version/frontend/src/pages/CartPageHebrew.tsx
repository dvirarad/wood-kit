import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import Navigation from '../components/Navigation';
import { useCart } from '../context/CartContext';

const CartPageHebrew: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              העגלה שלך ריקה
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              לא הוספת עדיין מוצרים לעגלה
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              href="/"
              sx={{ mt: 2 }}
            >
              המשך קנייה
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          העגלה שלך
        </Typography>

        <Paper elevation={2} sx={{ p: 2 }}>
          <List>
            {state.items.map((item, index) => (
              <Box key={`${item.productId}-${index}`}>
                <ListItem 
                  sx={{ 
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            מחיר יחידה: ₪{Math.round(item.calculatedPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            סה"כ: ₪{Math.round(item.calculatedPrice * item.quantity)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                    
                    <Typography variant="body1" sx={{ minWidth: '40px', textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    
                    <IconButton 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  
                  <IconButton 
                    onClick={() => removeItem(item.productId)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                {index < state.items.length - 1 && <Divider />}
              </Box>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="h5" component="h2">
              סך הכל: ₪{Math.round(state.total)}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={clearCart}
              >
                רוקן עגלה
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                size="large"
              >
                המשך לתשלום
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CartPageHebrew;
