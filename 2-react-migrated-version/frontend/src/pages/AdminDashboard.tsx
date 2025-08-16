import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  TrendingUp as SalesIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import APP_VERSION from '../config/version';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const statsData = [
    { title: 'סך מוצרים', value: '24', icon: <ProductsIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { title: 'הזמנות חדשות', value: '8', icon: <OrdersIcon sx={{ fontSize: 40 }} />, color: '#ed6c02' },
    { title: 'לקוחות פעילים', value: '156', icon: <CustomersIcon sx={{ fontSize: 40 }} />, color: '#2e7d32' },
    { title: 'מכירות החודש', value: '₪12,450', icon: <SalesIcon sx={{ fontSize: 40 }} />, color: '#9c27b0' },
  ];

  const recentOrders = [
    { id: '1001', customer: 'יוסי כהן', product: 'ארון ספרים אמסטרדם', status: 'בטיפול', amount: '₪850' },
    { id: '1002', customer: 'שרה לוי', product: 'ספסל גן', status: 'הושלם', amount: '₪650' },
    { id: '1003', customer: 'דוד מור', product: 'מיטת כלב', status: 'חדש', amount: '₪320' },
    { id: '1004', customer: 'רחל אבן', product: 'עציץ עץ', status: 'בשליחה', amount: '₪180' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'הושלם': return 'success';
      case 'בטיפול': return 'warning';
      case 'בשליחה': return 'info';
      case 'חדש': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" component="h1">
              פאנל ניהול
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            התנתק
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          {statsData.map((stat, index) => (
            <Box key={index} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: stat.color, mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="h3" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Quick Actions */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                פעולות מהירות
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<ProductsIcon />}
                  onClick={() => navigate('/admin/products')}
                  fullWidth
                >
                  ניהול מוצרים
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<OrdersIcon />}
                  fullWidth
                >
                  צפייה בהזמנות
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<CustomersIcon />}
                  fullWidth
                >
                  ניהול לקוחות
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Recent Orders */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                הזמנות אחרונות
              </Typography>
              <List>
                {recentOrders.map((order, index) => (
                  <Box key={order.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              הזמנה #{order.id}
                            </Typography>
                            <Chip 
                              label={order.status} 
                              size="small" 
                              color={getStatusColor(order.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {order.customer} • {order.product}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                              {order.amount}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>

        {/* Version Display */}
        <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            גרסה {APP_VERSION.version} • Build {APP_VERSION.buildNumber} • {new Date(APP_VERSION.buildDate).toLocaleDateString('he-IL')}
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default AdminDashboard;
