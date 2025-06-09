import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Components and Pages
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DossierDetailPage from './pages/DossierDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

// --- NEW: Our "Midnight Blue" Theme Definition ---
const midnightBlueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00F5FF', // A sharp cyan for primary actions
    },
    background: {
      default: '#0B111E', // A very dark navy blue
      paper: '#121826', // A slightly lighter navy for surfaces
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#A0A0A0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Add subtle rounded corners
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Add subtle rounded corners
        },
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dossiers/:dossierId',
        element: <DossierDetailPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

function App() {
  return (
    // We now use our new theme here
    <ThemeProvider theme={midnightBlueTheme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;