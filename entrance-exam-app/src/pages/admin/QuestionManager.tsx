import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  marks: number;
}

const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    subject: '',
    marks: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const subjects = ['Mathematics', 'English', 'Science', 'General Knowledge'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions);
    } catch (error: any) {
      setError('Error fetching questions');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      subject: '',
      marks: 1,
    });
    setEditMode(false);
    setEditId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const questionData = {
      question: formData.question,
      options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
      correctAnswer: formData.correctAnswer,
      subject: formData.subject,
      marks: formData.marks,
    };

    try {
      const token = localStorage.getItem('token');
      if (editMode) {
        await axios.put(`/api/questions/${editId}`, questionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question updated successfully');
      } else {
        await axios.post('/api/questions', questionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question added successfully');
      }
      
      fetchQuestions();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving question');
    }
  };

  const handleEdit = (question: Question) => {
    setFormData({
      question: question.question,
      optionA: question.options[0],
      optionB: question.options[1],
      optionC: question.options[2],
      optionD: question.options[3],
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      marks: question.marks,
    });
    setEditMode(true);
    setEditId(question._id);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Question deleted successfully');
      fetchQuestions();
    } catch (error: any) {
      setError('Error deleting question');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Question Manager
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editMode ? 'Edit Question' : 'Add New Question'}
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Question"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Option A"
                      name="optionA"
                      value={formData.optionA}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Option B"
                      name="optionB"
                      value={formData.optionB}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Option C"
                      name="optionC"
                      value={formData.optionC}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Option D"
                      name="optionD"
                      value={formData.optionD}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Correct Answer</InputLabel>

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
    ...prev,
    [name as string]: value,
  }));
};                  
<Select
  name="correctAnswer"
  value={formData.correctAnswer}
  onChange={handleSelectChange} // Correctly typed handler
  required
  label="Correct Answer"
>
  <MenuItem value={formData.optionA}>Option A</MenuItem>
  <MenuItem value={formData.optionB}>Option B</MenuItem>
  <MenuItem value={formData.optionC}>Option C</MenuItem>
  <MenuItem value={formData.optionD}>Option D</MenuItem>
</Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    label="Subject"
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Marks"
                  name="marks"
                  type="number"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {editMode ? 'Update Question' : 'Add Question'}
                  </Button>
                  {editMode && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question List
              </Typography>
              <List>
                {questions.map((question) => (
                  <ListItem
                    key={question._id}
                    divider
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <ListItemText
                      primary={question.question}
                      secondary={`Subject: ${question.subject} | Marks: ${question.marks}`}
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEdit(question)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(question._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default QuestionManager; 