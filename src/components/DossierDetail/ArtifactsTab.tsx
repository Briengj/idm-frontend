import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Link,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContentText,
  LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { type SelectChangeEvent } from '@mui/material';
import apiClient from '../../api/apiClient';
import axios from 'axios';

interface Artifact {
  id: string;
  name: string;
  artifactType: 'URL' | 'TextSnippet' | 'File';
  sourceOrContent: string;
  originalFileName?: string;
  fileSize?: number;
}

interface TabPanelProps {
  dossierId: string;
}

interface NewArtifactState {
  name: string;
  artifactType: 'URL' | 'TextSnippet';
  sourceOrContent: string;
}

export default function ArtifactsTab({ dossierId }: TabPanelProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [addManualOpen, setAddManualOpen] = useState(false);
  const [newManualArtifact, setNewManualArtifact] = useState<NewArtifactState>({ name: '', artifactType: 'URL', sourceOrContent: '' });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadArtifactName, setUploadArtifactName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentItem, setCurrentItem] = useState<Artifact | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const fetchArtifacts = async () => {
    if (!dossierId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/dossiers/${dossierId}/artifacts`);
      setArtifacts(response.data);
    } catch (error) {
      console.error("Failed to fetch artifacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, [dossierId]);
  
  const handleAddManualOpen = () => setAddManualOpen(true);
  const handleAddManualClose = () => {
    setAddManualOpen(false);
    setNewManualArtifact({ name: '', artifactType: 'URL', sourceOrContent: '' });
  };
  const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewManualArtifact(prev => ({ ...prev, [name]: value as string }));
  };
  const handleCreateManualArtifact = async () => {
    if (!newManualArtifact.name || !newManualArtifact.sourceOrContent) return;
    try {
      await apiClient.post(`/dossiers/${dossierId}/artifacts/manual`, newManualArtifact);
      handleAddManualClose();
      fetchArtifacts();
    } catch (error) {
      console.error('Failed to create artifact:', error);
    }
  };
  
  const handleUploadOpen = () => setUploadOpen(true);
  const handleUploadClose = () => {
    setUploadOpen(false);
    setFileToUpload(null);
    setUploadArtifactName('');
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };
  const handleFileUpload = async () => {
    if (!fileToUpload || !uploadArtifactName) {
      alert('Please select a file and provide a name.');
      return;
    }
    setIsUploading(true);
    try {
      const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9_.\- ]/g, '_');
      const contentType = fileToUpload.type || 'application/octet-stream';
      const presignedUrlResponse = await apiClient.post(`/dossiers/${dossierId}/artifacts/generate-upload-url`, {
        fileName: safeFileName,
        contentType: contentType,
      });
      const { signedUrl, gcsKey } = presignedUrlResponse.data;
      await axios.put(signedUrl, fileToUpload, {
        headers: { 'Content-Type': contentType },
      });
      await apiClient.post(`/dossiers/${dossierId}/artifacts/notify-upload`, {
        name: uploadArtifactName,
        artifactType: 'File',
        gcsKey: gcsKey,
        originalFileName: fileToUpload.name,
        mimeType: contentType,
        fileSize: fileToUpload.size
      });
      handleUploadClose();
      fetchArtifacts();
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteOpen = (artifact: Artifact) => { setCurrentItem(artifact); setDeleteOpen(true); };
  const handleDeleteClose = () => { setDeleteOpen(false); setCurrentItem(null); };
  const handleConfirmDelete = async () => {
    if (!currentItem) return;
    try {
      await apiClient.delete(`/dossiers/${dossierId}/artifacts/${currentItem.id}`);
      handleDeleteClose();
      fetchArtifacts();
    } catch (error) { console.error('Failed to delete artifact:', error); }
  };
  const handleEditOpen = (artifact: Artifact) => { setCurrentItem(artifact); setEditOpen(true); };
  const handleEditClose = () => { setEditOpen(false); setCurrentItem(null); };
  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentItem) return;
    setCurrentItem({ ...currentItem, [event.target.name]: event.target.value });
  };
  const handleUpdateArtifact = async () => {
    if (!currentItem) return;
    try {
      await apiClient.patch(`/dossiers/${dossierId}/artifacts/${currentItem.id}`, { name: currentItem.name, sourceOrContent: currentItem.sourceOrContent });
      handleEditClose();
      fetchArtifacts();
    } catch (error) { console.error('Failed to update artifact:', error); }
  };

  const getIconForType = (type: Artifact['artifactType']) => {
    switch (type) {
      case 'URL': return <LinkIcon />;
      case 'TextSnippet': return <DescriptionIcon />;
      case 'File': return <InsertDriveFileIcon />;
      default: return <InsertDriveFileIcon />;
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleAddManualOpen}>Add URL / Snippet</Button>
        <Button variant="contained" onClick={handleUploadOpen}>Upload File</Button>
      </Box>
      
      {artifacts.length > 0 ? (
        <Box>{artifacts.map((artifact) => (
          <Card key={artifact.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getIconForType(artifact.artifactType)}
                <Typography variant="h6" component="div" sx={{ ml: 1 }}>{artifact.name}</Typography>
              </Box>
              {artifact.artifactType === 'URL' && <Link href={artifact.sourceOrContent} target="_blank" rel="noopener noreferrer">{artifact.sourceOrContent}</Link>}
              {artifact.artifactType === 'TextSnippet' && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{artifact.sourceOrContent}</Typography>}
              {artifact.artifactType === 'File' && <Typography variant="body2" color="text.secondary">File: {artifact.originalFileName} ({(artifact.fileSize! / 1024).toFixed(2)} KB)</Typography>}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleEditOpen(artifact)} disabled={artifact.artifactType === 'File'}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDeleteOpen(artifact)}><DeleteIcon /></IconButton>
            </CardActions>
          </Card>
        ))}</Box>
      ) : (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>No artifacts have been added to this dossier yet.</Typography>
      )}

      <Dialog open={addManualOpen} onClose={handleAddManualClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Artifact</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Artifact Type</InputLabel>
            <Select name="artifactType" value={newManualArtifact.artifactType} onChange={handleManualInputChange}>
              <MenuItem value="URL">URL</MenuItem>
              <MenuItem value="TextSnippet">Text Snippet</MenuItem>
            </Select>
          </FormControl>
          <TextField autoFocus margin="dense" name="name" label="Name / Title" type="text" fullWidth variant="standard" value={newManualArtifact.name} onChange={handleManualInputChange}/>
          <TextField margin="dense" name="sourceOrContent" label={newManualArtifact.artifactType === 'URL' ? 'URL' : 'Content'} type="text" fullWidth multiline={newManualArtifact.artifactType === 'TextSnippet'} rows={newManualArtifact.artifactType === 'TextSnippet' ? 4 : 1} variant="standard" value={newManualArtifact.sourceOrContent} onChange={handleManualInputChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddManualClose}>Cancel</Button>
          <Button onClick={handleCreateManualArtifact}>Create</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={uploadOpen} onClose={isUploading ? undefined : handleUploadClose}>
        <DialogTitle>Upload a File Artifact</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Artifact Name" type="text" fullWidth variant="standard" value={uploadArtifactName} onChange={(e) => setUploadArtifactName(e.target.value)} disabled={isUploading} sx={{mb: 2}}/>
          <Button component="label" variant="outlined" disabled={isUploading}>
            Choose File
            <input type="file" hidden onChange={handleFileSelect} />
          </Button>
          {fileToUpload && <Typography sx={{display: 'inline', ml: 2}}>{fileToUpload.name}</Typography>}
          {isUploading && <LinearProgress sx={{mt: 2}}/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleFileUpload} disabled={!fileToUpload || !uploadArtifactName || isUploading}>Upload</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Artifact</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Name / Title" type="text" fullWidth variant="standard" value={currentItem?.name || ''} onChange={handleEditInputChange}/>
          <TextField margin="dense" name="sourceOrContent" label={currentItem?.artifactType === 'URL' ? 'URL' : 'Content'} type="text" fullWidth multiline={currentItem?.artifactType === 'TextSnippet'} rows={currentItem?.artifactType === 'TextSnippet' ? 4 : 1} variant="standard" value={currentItem?.sourceOrContent || ''} onChange={handleEditInputChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdateArtifact}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Artifact?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the artifact "{currentItem?.name}"?
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