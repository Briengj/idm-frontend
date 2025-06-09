import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/apiClient';
import {
  Typography,
  List,
  ListItemText,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ListItemButton
} from '@mui/material';

interface Dossier {
  id: string;
  subjectName: string;
  status: string;
}

export default function DashboardPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');

  const fetchDossiers = async () => {
    try {
      const response = await apiClient.get('/dossiers');
      setDossiers(response.data);
    } catch (error) {
      console.error('Failed to fetch dossiers:', error);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSubjectName('');
  };

  const handleCreateDossier = async () => {
    if (!subjectName) return;
    try {
      await apiClient.post('/dossiers', { subjectName });
      handleClose();
      fetchDossiers();
    } catch (error) {
      console.error('Failed to create dossier:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Dossier Dashboard
        </Typography>
        <Button variant="contained" onClick={handleOpen}>
          Create New Dossier
        </Button>
      </Box>

      {dossiers.length > 0 ? (
        <List>
          {dossiers.map((dossier) => (
            <ListItemButton
              key={dossier.id}
              component={RouterLink}
              to={`/dossiers/${dossier.id}`}
            >
              <ListItemText
                primary={dossier.subjectName}
                secondary={`Status: ${dossier.status}`}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography>You have no dossiers yet. Create one to get started!</Typography>
      )}

      {/* The Create Dossier Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create a New Dossier</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="subjectName"
            label="Subject Name"
            type="text"
            fullWidth
            variant="standard"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateDossier}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}