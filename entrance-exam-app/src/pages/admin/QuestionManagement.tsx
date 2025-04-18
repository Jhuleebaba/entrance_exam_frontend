import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Grid,
  Tabs,
  Tab,
  Divider,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon 
} from '@mui/icons-material';
import axios from 'axios';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  marks: number;
}

interface SubjectQuestions {
  _id: string; // subject name
  questions: Question[];
}

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'General Knowledge'
];

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsBySubject, setQuestionsBySubject] = useState<SubjectQuestions[]>([]);
  const [subjects, setSubjects] = useState<string[]>(AVAILABLE_SUBJECTS);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    subject: '',
    marks: 1,
  });

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching questions');
    }
  };

  const fetchQuestionsBySubject = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/questions/by-subject', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setQuestionsBySubject(response.data.questionsBySubject || []);

    // Get unique subjects, including any custom subjects from the database
    const dbSubjects = response.data.subjects || [];
    const allSubjects = Array.from(new Set([...AVAILABLE_SUBJECTS, ...dbSubjects]));
    setSubjects(allSubjects);

    // Set active subject to first one if not already set
    if (!activeSubject && allSubjects.length > 0) {
      setActiveSubject(allSubjects[0]);
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Error fetching questions by subject');
  }
}, [activeSubject]);

  const handleOpen = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        subject: question.subject,
        marks: question.marks,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        subject: activeSubject || subjects[0] || '',
        marks: 1,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleUploadOpen = () => {
    setUploadOpen(true);
    setUploadSubject(activeSubject || '');
    setSelectedFile(null);
    setError('');
    setSuccess('');
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
    setError('');
    setSuccess('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Fetch questions when switching to All Questions tab
    if (newValue === 1) {
      fetchQuestions();
    }
  };

  const handleActiveSubjectChange = (subject: string) => {
    setActiveSubject(subject);
  };

  const handleAddNewSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
      setActiveSubject(newSubject);
      setNewSubject('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!uploadSubject) {
      setError('Please select a subject');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('subject', uploadSubject);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/questions/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        handleUploadClose();
        fetchQuestionsBySubject();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingQuestion) {
        await axios.put(`/api/questions/${editingQuestion._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question updated successfully');
      } else {
        await axios.post('/api/questions', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question added successfully');
      }
      fetchQuestionsBySubject();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving question');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchQuestionsBySubject();
        setSuccess('Question deleted successfully');
      } catch (error: any) {
        setError(error.response?.data?.message || 'Error deleting question');
      }
    }
  };

  const renderSubjectTabs = () => {
    return (
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="subject tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="By Subject" />
        <Tab label="All Questions" />
      </Tabs>
    );
  };

  const renderSubjectCards = () => {
    return (
      <Grid container spacing={3}>
        {subjects.map(subject => {
          const subjectData = questionsBySubject.find(s => s._id === subject);
          const questionCount = subjectData ? subjectData.questions.length : 0;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={subject}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: activeSubject === subject ? '2px solid #1976d2' : 'none'
                }}
              >
                <CardHeader 
                  title={subject}
                  titleTypographyProps={{ variant: 'h6' }}
                  action={
                    <Chip 
                      label={`${questionCount} questions`} 
                      color="primary" 
                      size="small" 
                    />
                  }
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {questionCount > 0 
                      ? `This subject contains ${questionCount} questions ready for the exam.` 
                      : 'No questions yet. Add questions using the buttons below.'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setActiveSubject(subject);
                      handleOpen();
                    }}
                  >
                    Add
                  </Button>
                  <Button 
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      setActiveSubject(subject);
                      handleUploadOpen();
                    }}
                  >
                    Upload
                  </Button>
                  <Button 
                    size="small"
                    color="inherit"
                    onClick={() => handleActiveSubjectChange(subject)}
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px dashed #ccc' }}>
            <CardHeader title="Add New Subject" />
            <CardContent sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                label="New Subject Name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                margin="normal"
                helperText="Enter a name for a new subject category"
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddNewSubject}
                disabled={!newSubject.trim() || subjects.includes(newSubject)}
              >
                Add Subject
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderQuestionsForActiveSubject = () => {
    const subjectData = questionsBySubject.find(s => s._id === activeSubject);
    const questionsToShow = subjectData ? subjectData.questions : [];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{activeSubject} Questions</Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ mr: 1 }}
            >
              Add Question
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileUploadIcon />}
              onClick={handleUploadOpen}
            >
              Bulk Upload
            </Button>
          </Box>
        </Box>
        
        {questionsToShow.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No questions found for {activeSubject}. Add some questions using the buttons above.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questionsToShow.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell>{question.question}</TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpen(question)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDelete(question._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  const renderAllQuestionsList = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>All Questions</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>{question.question}</TableCell>
                  <TableCell>{question.subject}</TableCell>
                  <TableCell>{question.marks}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleOpen(question)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDelete(question._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Question Management
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Box>

      {renderSubjectTabs()}

      {currentTab === 0 && (
        <Box>
          <Box sx={{ mb: 4 }}>
            {renderSubjectCards()}
          </Box>
          
          {activeSubject && (
            <Divider sx={{ my: 4 }} />
          )}
          
          {activeSubject && renderQuestionsForActiveSubject()}
        </Box>
      )}

      {currentTab === 1 && renderAllQuestionsList()}

      {/* Question Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            {formData.options.map((option, index) => (
              <TextField
                key={index}
                fullWidth
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[index] = e.target.value;
                  setFormData({ ...formData, options: newOptions });
                }}
                margin="normal"
              />
            ))}
            <FormControl fullWidth margin="normal">
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                label="Correct Answer"
              >
                {formData.options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option || `Option ${index + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
              margin="normal"
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingQuestion ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Bulk Upload Questions
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Required Document Format:</Typography>
              <Typography variant="body2">
                Format each question as follows:
              </Typography>
              <Box component="pre" sx={{ 
                mt: 1, 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1, 
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap'
              }}>
{`Q: [Question text]
A: [Option A]
B: [Option B]
C: [Option C]
D: [Option D]
Correct: [A/B/C/D]
Marks: [number]`}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Separate each question with a blank line. The system will identify the correct answer from the "Correct:" line.
              </Typography>
            </Alert>
            
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                mt: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".doc,.docx,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile ? selectedFile.name : 'Click to Select File'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: .doc, .docx, .pdf (max 10MB)
              </Typography>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After uploading, the system will parse the document and extract questions according to the format above.
              This may take a few minutes for large documents.
            </Typography>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="warning.dark">
                Important Notes:
              </Typography>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Make sure the "Correct:" line explicitly states which option is correct (A, B, C, or D)</li>
                <li>All questions in the document will be assigned to the selected subject</li>
                <li>Each question must have exactly 4 options</li>
                <li>Include the "Marks:" line to specify point value (defaults to 1 if omitted)</li>
              </ul>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} disabled={isUploading}>Cancel</Button>
          <Button 
            onClick={handleUploadSubmit} 
            color="primary" 
            variant="contained"
            disabled={!selectedFile || !uploadSubject || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionManagement; 
