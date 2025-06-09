import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../api/apiClient';

interface SubjectProfileItem {
  id: string;
  itemType: string;
  itemValue: string;
}

interface TabPanelProps {
  dossierId: string;
}

export default function SubjectProfileTab({ dossierId }: TabPanelProps) {
  const [items, setItems] = useState<SubjectProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ itemType: '', itemValue: '' });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<SubjectProfileItem | null>(null);

  const fetchProfileItems = async () => {
    if (!dossierId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/dossiers/${dossierId}/subject-profile-items`);
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch subject profile items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileItems();
  }, [dossierId]);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setNewItem({ itemType: '', itemValue: '' });
  };
  const handleNewItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };
  const handleAddItem = async () => {
    if (!newItem.itemType || !newItem.itemValue) {
      alert('Both Type and Value fields are required.');
      return;
    }
    try {
      await apiClient.post(`/dossiers/${dossierId}/subject-profile-items`, newItem);
      handleAddClose();
      fetchProfileItems();
    } catch (error) {
      console.error('Failed to add profile item:', error);
    }
  };

  const handleEditOpen = (item: SubjectProfileItem) => {
    setCurrentItem(item);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentItem(null);
  };
  const handleCurrentItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (currentItem) {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };
  const handleUpdateItem = async () => {
    if (!currentItem) return;
    try {
      await apiClient.patch(`/dossiers/${dossierId}/subject-profile-items/${currentItem.id}`, {
        itemType: currentItem.itemType,
        itemValue: currentItem.itemValue,
      });
      handleEditClose();
      fetchProfileItems();
    } catch (error) {
      console.error('Failed to update profile item:', error);
    }
  };

  const handleDeleteOpen = (item: SubjectProfileItem) => {
    setCurrentItem(item);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setCurrentItem(null);
  };
  const handleConfirmDelete = async () => {
    if (!currentItem) return;
    try {
      await apiClient.delete(`/dossiers/${dossierId}/subject-profile-items/${currentItem.id}`);
      handleDeleteClose();
      fetchProfileItems();
    } catch (error) {
      console.error('Failed to delete profile item:', error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleAddOpen}>
          Add Profile Item
        </Button>
      </Box>

      {items.length > 0 ? (
        <TableContainer component={Paper}>
          <Table aria-label="subject profile table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">{item.itemType}</TableCell>
                  <TableCell>{item.itemValue}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditOpen(item)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteOpen(item)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          No subject profile items have been added to this dossier yet.
        </Typography>
      )}

      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Add New Profile Item</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="itemType" label="Type" type="text" fullWidth variant="standard" value={newItem.itemType} onChange={handleNewItemChange} />
          <TextField margin="dense" name="itemValue" label="Value" type="text" fullWidth variant="standard" value={newItem.itemValue} onChange={handleNewItemChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button onClick={handleAddItem}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Profile Item</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="itemType" label="Type" type="text" fullWidth variant="standard" value={currentItem?.itemType || ''} onChange={handleCurrentItemChange} />
          <TextField margin="dense" name="itemValue" label="Value" type="text" fullWidth variant="standard" value={currentItem?.itemValue || ''} onChange={handleCurrentItemChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdateItem}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the item "{currentItem?.itemType}: {currentItem?.itemValue}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}