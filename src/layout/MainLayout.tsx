import { AppBar, Box, Toolbar, Typography, Button, Link } from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          {/* The title is now wrapped in a Link component */}
          <Link
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              color: 'inherit', // Make the link color match the text
              textDecoration: 'none', // Remove the underline
            }}
          >
            <Typography variant="h6" component="div">
              Investigation Dossier Manager
            </Typography>
          </Link>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: 3, width: '100%' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}