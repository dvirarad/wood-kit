import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CartProvider } from './context/CartContext';
import TestPage from './pages/TestPage';
import SimpleHome from './pages/SimpleHome';
import MinimalTest from './pages/MinimalTest';
import HomePageHebrew from './pages/HomePageHebrew';
import ProductPageHebrew from './pages/ProductPageHebrew';
import CartPageHebrew from './pages/CartPageHebrew';
import AboutPageHebrew from './pages/AboutPageHebrew';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';

// Hebrew RTL theme
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: [
      'Rubik',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  palette: {
    primary: {
      main: '#8B4513',
    },
    secondary: {
      main: '#D2691E',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
          fontFamily: 'Rubik, Arial, sans-serif',
        },
        '*': {
          direction: 'rtl',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePageHebrew />} />
            <Route path="/home" element={<HomePageHebrew />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/product/:productId" element={<ProductPageHebrew />} />
            <Route path="/cart" element={<CartPageHebrew />} />
            <Route path="/about" element={<AboutPageHebrew />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;