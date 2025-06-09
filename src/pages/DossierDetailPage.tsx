import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { type SelectChangeEvent } from '@mui/material';

// These imports will show an error until we create the files in the next steps.
import SubjectProfileTab from '../components/DossierDetail/SubjectProfileTab';
import NotesTab from '../components/DossierDetail/NotesTab';
import ArtifactsTab from '../components/DossierDetail/ArtifactsTab';

interface DossierDetails {
  id: string;
  subjectName: string;
  caseId: string | null;
  summary: string | null;
  status: 'Open' | 'Closed';
}

type UpdateDossierDto = Partial<Omit<DossierDetails, 'id'>>;

export default function DossierDetailPage() {
  const { dossierId } = useParams<{ dossierId: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<DossierDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UpdateDossierDto>({});
  const [tabValue, setTabValue] = useState('1');

  const fetchDossier = async () => {
    if (!dossierId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/dossiers/${dossierId}`);
      setDossier(response.data);
    } catch (error) {
      console.error('Failed to fetch dossier details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [dossierId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleDeleteOpen = () => setDeleteOpen(true);
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/dossiers/${dossierId}`);
      handleDeleteClose();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete dossier:', error);
    }
  };

  const handleEditOpen = () => {
    if (dossier) {
      setEditData({
        subjectName: dossier.subjectName,
        caseId: dossier.caseId,
        summary: dossier.summary,
        status: dossier.status
      });
    }
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);

  const handleUpdateDossier = async () => {
    try {
      await apiClient.patch(`/dossiers/${dossierId}`, editData);
      handleEditClose();
      fetchDossier();
    } catch (error) {
      console.error('Failed to update dossier:', error);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    setEditData({
      ...editData,
      [event.target.name as string]: event.target.value,
    });
  };

  if (loading) return <CircularProgress />;
  if (!dossier) return <Typography>Dossier not found.</Typography>;

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>{dossier.subjectName}</Typography>
            <Typography variant="h6" color="text.secondary">Case ID: {dossier.caseId || 'N/A'}</Typography>
          </Box>
          <Box>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={handleEditOpen}>Edit</Button>
            <Button variant="contained" color="error" onClick={handleDeleteOpen}>Delete</Button>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}><strong>Status:</strong> {dossier.status}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}><strong>Summary:</strong> {dossier.summary || 'No summary provided.'}</Typography>
      </Paper>

      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="Dossier Sections">
            <Tab label="Subject Profile" value="1" />
            <Tab label="Notes" value="2" />
            <Tab label="Artifacts" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1"><SubjectProfileTab dossierId={dossier.id} /></TabPanel>
        <TabPanel value="2"><NotesTab dossierId={dossier.id} /></TabPanel>
        <TabPanel value="3"><ArtifactsTab dossierId={dossier.id} /></TabPanel>
      </TabContext>

      {/* Dialogs for Edit and Delete */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Dossier?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the dossier for "{dossier.subjectName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Dossier</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="subjectName" label="Subject Name" type="text" fullWidth variant="standard" value={editData.subjectName || ''} onChange={handleEditChange} sx={{ mb: 2 }}/>
          <TextField margin="dense" name="caseId" label="Case ID" type="text" fullWidth variant="standard" value={editData.caseId || ''} onChange={handleEditChange} sx={{ mb: 2 }}/>
          <TextField margin="dense" name="summary" label="Summary" type="text" fullWidth multiline rows={4} variant="standard" value={editData.summary || ''} onChange={handleEditChange} sx={{ mb: 2 }}/>
          <FormControl fullWidth variant="standard">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={editData.status || 'Open'} onChange={handleEditChange}>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdateDossier}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}