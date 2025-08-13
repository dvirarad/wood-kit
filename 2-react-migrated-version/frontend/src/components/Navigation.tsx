import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Badge
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { state, getItemCount } = useCart();
  
  const cartItemCount = getItemCount();

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ direction: 'rtl' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/admin/login')}
            title="כניסת מנהל"
          >
            <AdminIcon />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/cart')}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/about')}
          >
            אודות
          </Button>
        </Box>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Wood Kits - מוצרי עץ מותאמים אישית
        </Typography>
        
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ ml: 2 }}
        >
          <HomeIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;