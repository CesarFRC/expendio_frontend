import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#131d35',
                color: '#f0f4ff',
                border: '1px solid #1e3a5f',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
