import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../api/apiClient';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface TabPanelProps {
  dossierId: string;
}

export default function NotesTab({ dossierId }: TabPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const fetchNotes = async () => {
    if (!dossierId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/dossiers/${dossierId}/notes`);
      const sortedNotes = response.data.sort((a: Note, b: Note) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(sortedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [dossierId]);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setNewNoteContent('');
  };
  const handleCreateNote = async () => {
    if (!newNoteContent) return;
    try {
      await apiClient.post(`/dossiers/${dossierId}/notes`, { content: newNoteContent });
      handleAddClose();
      fetchNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleEditOpen = (note: Note) => {
    setCurrentNote(note);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentNote(null);
  };
  const handleUpdateNote = async () => {
    if (!currentNote) return;
    try {
      await apiClient.patch(`/dossiers/${dossierId}/notes/${currentNote.id}`, { content: currentNote.content });
      handleEditClose();
      fetchNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteOpen = (note: Note) => {
    setCurrentNote(note);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setCurrentNote(null);
  };
  const handleConfirmDelete = async () => {
    if (!currentNote) return;
    try {
      await apiClient.delete(`/dossiers/${dossierId}/notes/${currentNote.id}`);
      handleDeleteClose();
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleAddOpen}>
          Add Note
        </Button>
      </Box>

      {notes.length > 0 ? (
        <Box>
          {notes.map((note) => (
            <Card key={note.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{note.content}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                  Last updated: {new Date(note.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleEditOpen(note)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDeleteOpen(note)}><DeleteIcon /></IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          No notes have been added to this dossier yet.
        </Typography>
      )}

      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note Content"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button onClick={handleCreateNote}>Save Note</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note Content"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={currentNote?.content || ''}
            onChange={(e) => setCurrentNote(prev => prev ? { ...prev, content: e.target.value } : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdateNote}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Note?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this note?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}