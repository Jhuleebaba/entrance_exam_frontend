import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon,
  Settings as SettingsIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  SuperscriptOutlined as SuperscriptIcon,
  SubscriptOutlined as SubscriptIcon,
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import './QuestionEditor.css';

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

// Custom Quill modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean'],
    ['formula'], // Math formula button
  ],
  clipboard: {
    // Toggle to add a custom pasted html handler
    matchVisual: false,
  }
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'script',
  'list', 'bullet',
  'color', 'background',
  'formula',
  'link', 'image', 'video',
];

const optionQuillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'color': [] }],
    ['formula'],
  ],
  clipboard: {
    matchVisual: false,
  }
};

const optionQuillFormats = [
  'bold', 'italic', 'underline',
  'script', 'color',
  'formula',
];

const QuestionManagement = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsBySubject, setQuestionsBySubject] = useState<SubjectQuestions[]>([]);
  const [subjects] = useState<string[]>([
    'Mathematics',
    'English',
    'Verbal Reasoning',
    'Quantitative Reasoning',
    'General Paper'
  ]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    subject: '',
    marks: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const [currentEditor, setCurrentEditor] = useState<string>('question');
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number>(-1);

  useEffect(() => {
    // Initial fetch of questions 
    fetchQuestions();
    // Also fetch questions by subject
    fetchQuestionsBySubject();
  }, []);

  useEffect(() => {
    // When subject changes, fetch questions for that subject
    if (activeSubject) {
      // Define function to fetch subjects
      const fetchForSubject = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(`/api/questions?subject=${activeSubject}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data.success) {
            setQuestions(response.data.questions.filter(
              (q: Question) => q.subject === activeSubject
            ));
          }
        } catch (error) {
          console.error("Error fetching questions by subject:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchForSubject();
    }
  }, [activeSubject]);

  useEffect(() => {
    // Set the first subject as active if available
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0]);
    }
  }, [subjects, activeSubject]);

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

  const fetchQuestionsBySubject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/questions/by-subject', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setQuestionsBySubject(response.data.questionsBySubject);
      }
    } catch (error) {
      console.error("Error fetching questions by subject:", error);
    }
  };

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

    if (newValue === 1) {
      fetchQuestions();
    }
  };

  const handleActiveSubjectChange = (subject: string) => {
    setActiveSubject(subject);
    // After setting the active subject, refresh the questions for this subject
    if (subject) {
      fetchQuestionsForSubject(subject);
    }
  };

  // Add a new function to fetch questions for a specific subject
  const fetchQuestionsForSubject = async (subject: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/questions?subject=${subject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setQuestions(response.data.questions.filter(
          (q: Question) => q.subject === subject
        ));
      }
    } catch (error) {
      console.error("Error fetching questions by subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSettings = () => {
    navigate('/admin/settings');
    window.addEventListener('focus', refreshSettings);
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
      // Update both questions and questionsBySubject
      await fetchQuestions();
      
      // If we have an active subject, refresh that subject's questions too
      if (activeSubject) {
        try {
          const response = await axios.get(`/api/questions?subject=${activeSubject}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data.success) {
            setQuestions(response.data.questions.filter(
              (q: Question) => q.subject === activeSubject
            ));
          }
        } catch (error) {
          console.error("Error refreshing questions by subject:", error);
        }
      }
      
      // Also fetch questions by subject to update the subject cards
      try {
        const subjectResponse = await axios.get('/api/questions/by-subject', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (subjectResponse.data.success) {
          setQuestionsBySubject(subjectResponse.data.questionsBySubject);
        }
      } catch (error) {
        console.error("Error refreshing questions by subject:", error);
      }
      
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
        
        // Update questions state immediately
        setQuestions(prevQuestions => prevQuestions.filter(q => q._id !== id));
        
        // Update questionsBySubject state immediately
        setQuestionsBySubject(prevSubjects => 
          prevSubjects.map(subject => ({
            ...subject,
            questions: subject.questions.filter(q => q._id !== id)
          }))
        );
        
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
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (subjects.length === 0) {
      return (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<SettingsIcon />}
              onClick={navigateToSettings}
            >
              Go to Settings
            </Button>
          }
        >
          No subjects are configured. Please go to Settings to add subjects first.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {subjects.map((subject) => {
          const subjectData = questionsBySubject.find((s) => s._id === subject);
          const questionCount = subjectData ? subjectData.questions.length : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={subject}>
              <Card
                variant={activeSubject === subject ? 'elevation' : 'outlined'}
                elevation={activeSubject === subject ? 3 : 0}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: activeSubject === subject ? 'primary.light' : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleActiveSubjectChange(subject)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {questionCount} questions
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubject(subject);
                      handleOpen();
                    }}
                  >
                    Add Question
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
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
                    <TableCell>
                      <div dangerouslySetInnerHTML={{ __html: question.question }} />
                    </TableCell>
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

        {questions.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No questions found. Add questions in the By Subject tab.
          </Alert>
        ) : (
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
                    <TableCell>
                      <div dangerouslySetInnerHTML={{ __html: question.question }} />
                    </TableCell>
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
        )}
      </Box>
    );
  };

  const refreshSettings = () => {
    // Implement refreshSettings function
  };

  // Function to insert special characters into the editor
  const insertSymbol = (symbol: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    
    const range = editor.getSelection();
    if (range) {
      editor.insertText(range.index, symbol);
      editor.setSelection({ index: range.index + symbol.length, length: 0 });
    } else {
      // If no selection, insert at the end
      const length = editor.getLength();
      editor.insertText(length - 1, symbol);
      editor.setSelection({ index: length - 1 + symbol.length, length: 0 });
    }
  };

  // Special symbols collection for mathematics
  const mathSymbols = [
    { symbol: '°', label: 'Degree' },
    { symbol: '²', label: 'Squared' },
    { symbol: '³', label: 'Cubed' },
    { symbol: '√', label: 'Square Root' },
    { symbol: '∛', label: 'Cube Root' },
    { symbol: 'π', label: 'Pi' },
    { symbol: '∑', label: 'Sum' },
    { symbol: '∫', label: 'Integral' },
    { symbol: '∞', label: 'Infinity' },
    { symbol: '≈', label: 'Approximately' },
    { symbol: '≠', label: 'Not Equal' },
    { symbol: '≤', label: 'Less Than or Equal' },
    { symbol: '≥', label: 'Greater Than or Equal' },
    { symbol: '±', label: 'Plus Minus' },
    { symbol: '×', label: 'Multiply' },
    { symbol: '÷', label: 'Divide' },
    { symbol: '∈', label: 'Element Of' },
    { symbol: '∉', label: 'Not Element Of' },
    { symbol: '∩', label: 'Intersection' },
    { symbol: '∪', label: 'Union' },
    { symbol: '⊂', label: 'Subset' },
    { symbol: '⊃', label: 'Superset' },
    { symbol: '∠', label: 'Angle' },
    { symbol: '∥', label: 'Parallel' },
    { symbol: '⊥', label: 'Perpendicular' },
    { symbol: 'Δ', label: 'Delta' },
    { symbol: 'θ', label: 'Theta' },
    { symbol: 'λ', label: 'Lambda' },
    { symbol: 'μ', label: 'Mu' },
    { symbol: 'σ', label: 'Sigma' },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Question Management
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<SettingsIcon />}
              onClick={navigateToSettings}
            >
              Manage Subjects
            </Button>
          }
        >
          Subjects are now configured in the Settings page. Please add or modify subjects in Settings first.
        </Alert>
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
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Question Text
            </Typography>
            {/* Special Symbols Toolbar */}
            <Box className="special-symbols">
              <Typography variant="caption" sx={{ width: '100%', mb: 1 }}>
                Special Symbols:
              </Typography>
              {mathSymbols.map((item, index) => (
                <Tooltip key={index} title={item.label}>
                  <Button
                    className="symbol-button"
                    onClick={() => {
                      setCurrentEditor('question');
                      setCurrentOptionIndex(-1);
                      setTimeout(() => insertSymbol(item.symbol), 0);
                    }}
                    size="small"
                    variant="outlined"
                  >
                    {item.symbol}
                  </Button>
                </Tooltip>
              ))}
            </Box>
            <ReactQuill
              ref={quillRef}
              value={formData.question}
              onChange={(value) => setFormData({ ...formData, question: value })}
              onFocus={() => {
                setCurrentEditor('question');
                setCurrentOptionIndex(-1);
              }}
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              style={{ height: '200px', marginBottom: '20px' }}
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Options
          </Typography>

          <Grid container spacing={2}>
            {formData.options.map((option, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="body2" gutterBottom>
                  Option {String.fromCharCode(65 + index)}
                </Typography>
                <Box className="special-symbols">
                  <Typography variant="caption" sx={{ width: '100%', mb: 1 }}>
                    Special Symbols:
                  </Typography>
                  {mathSymbols.slice(0, 10).map((item, symbolIndex) => (
                    <Tooltip key={symbolIndex} title={item.label}>
                      <Button
                        className="symbol-button"
                        onClick={() => {
                          setCurrentEditor('option');
                          setCurrentOptionIndex(index);
                        }}
                        size="small"
                        variant="outlined"
                      >
                        {item.symbol}
                      </Button>
                    </Tooltip>
                  ))}
                </Box>
                <ReactQuill
                  ref={currentEditor === 'option' && currentOptionIndex === index ? quillRef : undefined}
                  value={option}
                  onChange={(value) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                  onFocus={() => {
                    setCurrentEditor('option');
                    setCurrentOptionIndex(index);
                  }}
                  theme="snow"
                  modules={optionQuillModules}
                  formats={optionQuillFormats}
                  className="option-editor"
                  style={{ height: '100px', marginBottom: '10px' }}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  label="Correct Answer"
                  required
                >
                  {formData.options.map((option, index) => (
                    option && (
                      <MenuItem key={index} value={option}>
                        <Typography variant="body2">
                          Option {String.fromCharCode(65 + index)}:&nbsp;
                          <span dangerouslySetInnerHTML={{ __html: option }} />
                        </Typography>
                      </MenuItem>
                    )
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  label="Subject"
                  required
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marks"
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                required
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingQuestion ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={handleUploadClose}>
        <DialogTitle>Bulk Upload Questions</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Upload questions from a CSV or Excel file.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The file should have columns for question, options, correct answer, and marks.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                label="Subject"
                required
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} disabled={isUploading}>Cancel</Button>
          <Button 
            onClick={handleUploadSubmit}
            variant="contained"
            color="primary"
            disabled={!selectedFile || !uploadSubject || isUploading}
          >
            {isUploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionManagement; 

