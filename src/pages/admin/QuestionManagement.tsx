import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import './QuestionEditor.css';
import MathRenderer from '../../components/MathRenderer';
import ExamPreview from '../../components/ExamPreview';

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

// Enhanced Quill modules configuration with proper formatting tools
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const quillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'script'
];

const optionQuillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'script': 'sub'}, { 'script': 'super' }]
  ],
  clipboard: {
    matchVisual: false,
  }
};

const optionQuillFormats = [
  'bold', 'italic', 'underline',
  'script'
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningDialog, setIsOpeningDialog] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const [currentEditor, setCurrentEditor] = useState<string>('question');
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number>(-1);
  const [previewTab, setPreviewTab] = useState<number>(0);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

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
    console.log('handleOpen called with question:', question?._id);
    
    if (isOpeningDialog) {
      console.log('Already opening dialog, ignoring...');
      return;
    }
    
    setIsOpeningDialog(true);
    
    // Use setTimeout to break the execution and prevent UI freeze
    setTimeout(() => {
      try {
        if (question) {
          console.log('Setting editing question:', question);
          setEditingQuestion(question);
          setFormData({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            subject: question.subject,
            marks: question.marks,
          });
        } else {
          console.log('Creating new question');
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
        console.log('Dialog should be open now');
      } catch (error) {
        console.error('Error in handleOpen:', error);
      } finally {
        setIsOpeningDialog(false);
      }
    }, 10);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
    setPreviewTab(0); // Reset preview tab
  };

  const handlePreviewQuestion = (question: Question) => {
    console.log('Preview button clicked for question:', question._id);
    setPreviewQuestion(question);
    setShowPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setShowPreviewDialog(false);
    setPreviewQuestion(null);
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

  const cleanHtmlContent = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    try {
      // Preserve essential formatting while removing dangerous content
      let cleaned = htmlContent
        // Clean up HTML entities first
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Remove dangerous tags but preserve formatting
        .replace(/<script.*?<\/script>/gi, '')
        .replace(/<style.*?<\/style>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        // Normalize paragraph breaks
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '')
        // Convert line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Preserve essential formatting tags (bold, italic, underline, super/subscript)
        .replace(/<strong>/gi, '<strong>')
        .replace(/<\/strong>/gi, '</strong>')
        .replace(/<b>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>')
        .replace(/<em>/gi, '<em>')
        .replace(/<\/em>/gi, '</em>')
        .replace(/<i>/gi, '<em>')
        .replace(/<\/i>/gi, '</em>')
        .replace(/<u>/gi, '<u>')
        .replace(/<\/u>/gi, '</u>')
        .replace(/<sup>/gi, '<sup>')
        .replace(/<\/sup>/gi, '</sup>')
        .replace(/<sub>/gi, '<sub>')
        .replace(/<\/sub>/gi, '</sub>')
        // Convert lists to simple formatting
        .replace(/<ol>/gi, '\n')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<ul>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        // Remove any remaining unwanted HTML tags while preserving content
        .replace(/<(?!\/?(strong|em|u|sup|sub)\b)[^>]*>/gi, '')
        // Clean up excessive whitespace but preserve intentional line breaks
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning HTML content:', error);
      return htmlContent; // Return original if cleaning fails
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called, editingQuestion:', editingQuestion?._id);
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring...');
      return;
    }
    
    // Basic validation
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }
    
    // Ensure we have exactly 4 options (backend requirement)
    if (formData.options.filter(option => option.trim()).length < 4) {
      setError('All 4 options are required');
      return;
    }
    
    if (!formData.correctAnswer.trim()) {
      setError('Correct answer is required');
      return;
    }
    
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(''); // Clear any previous errors
    
    try {
      const token = localStorage.getItem('token');
      
      // Clean the content before sending to server
      const cleanedOptions = formData.options.map(option => cleanHtmlContent(option));
      const cleanedFormData = {
        ...formData,
        question: cleanHtmlContent(formData.question),
        options: cleanedOptions,
        correctAnswer: cleanHtmlContent(formData.correctAnswer)
      };
      
      // Validate that cleaned correct answer is still one of the cleaned options
      if (!cleanedOptions.includes(cleanedFormData.correctAnswer)) {
        console.error('Validation error: Correct answer not found in cleaned options');
        console.error('Cleaned correct answer:', cleanedFormData.correctAnswer);
        console.error('Cleaned options:', cleanedOptions);
        setError('Correct answer must be one of the provided options');
        return;
      }
      
      console.log('Cleaned form data:', cleanedFormData);
      console.log('Original form data:', formData);
      console.log('Editing question ID:', editingQuestion?._id);
      console.log('Request URL:', `/api/questions/${editingQuestion?._id}`);
      
      let response;
      if (editingQuestion) {
        console.log('Making PUT request to update question...');
        response = await axios.put(`/api/questions/${editingQuestion._id}`, cleanedFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('PUT response received:', response.data);
        setSuccess('Question updated successfully');
      } else {
        response = await axios.post('/api/questions', cleanedFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question added successfully');
      }
      
      console.log('API response:', response.data);
      
      // Refresh data first, then close dialog
      await fetchQuestions();
      await fetchQuestionsBySubject();
      
      // Update the local state immediately for the active subject
      if (activeSubject) {
        await fetchQuestionsForSubject(activeSubject);
      }
      
      // Close dialog after data is refreshed
      handleClose();
      
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
        fullError: error
      });
      setError(error.response?.data?.message || 'Error saving question');
    } finally {
      setIsSubmitting(false);
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
                      <MathRenderer 
                        content={question.question} 
                        variant="text"
                        sx={{ 
                          maxWidth: '400px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                    </TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewQuestion(question)}
                        sx={{ mr: 1 }}
                        size="small"
                        variant="outlined"
                      >
                        Preview
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpen(question)}
                        sx={{ mr: 1 }}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDelete(question._id)}
                        size="small"
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
                      <MathRenderer 
                        content={question.question} 
                        variant="text"
                        sx={{ 
                          maxWidth: '400px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                    </TableCell>
                    <TableCell>{question.subject}</TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewQuestion(question)}
                        sx={{ mr: 1 }}
                        size="small"
                        variant="outlined"
                      >
                        Preview
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpen(question)}
                        sx={{ mr: 1 }}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDelete(question._id)}
                        size="small"
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
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Mathematical Formatting Tips:</strong><br/>
              • Use KaTeX syntax: <code>{'$x^2 + y^2 = r^2$'}</code> for inline math<br/>
              • Use <code>{'$$\\int_0^{\\infty} e^{-x} dx$$'}</code> for display math<br/>
              • Click symbols below or use unicode: x², √, π, α, β, ±, ≠, ≤, ≥
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Question Text
            </Typography>
            {/* Mathematical Symbols Toolbar */}
            <Box className="special-symbols">
              <Typography variant="caption" sx={{ width: '100%', mb: 1, fontWeight: 'bold' }}>
                Quick Insert Symbols:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                 {/* Math symbols removed for performance */}
              </Box>
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                For complex expressions, use KaTeX: <code>{'$x^2$'}</code> or <code>{'$$\\frac{a}{b}$$'}</code>
              </Typography>
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
                {/* Math symbols removed for performance */}
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

          {/* Preview Section */}
          {(formData.question || formData.options.some(opt => opt)) && (
            <Box sx={{ mt: 3 }}>
              <Tabs
                value={previewTab}
                onChange={(e, newValue) => setPreviewTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Quick Preview" />
                <Tab label="Exam Preview" />
              </Tabs>
              
              {previewTab === 0 ? (
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Quick Preview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {formData.question && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Question:
                      </Typography>
                      <MathRenderer 
                        content={formData.question} 
                        variant="question"
                        sx={{ 
                          p: 1, 
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.300'
                        }}
                      />
                    </Box>
                  )}
                  
                  {formData.options.some(opt => opt) && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Options:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {formData.options.map((option, index) => (
                          option && (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, minWidth: '25px', color: 'primary.main' }}>
                                {String.fromCharCode(65 + index)}.
                              </Typography>
                              <MathRenderer 
                                content={option} 
                                variant="option"
                                sx={{ flex: 1 }}
                              />
                            </Box>
                          )
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Exam Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This is exactly how your question will appear in the actual exam
                  </Typography>
                  <ExamPreview
                    question={formData.question}
                    options={formData.options}
                    subject={formData.subject || 'Sample Subject'}
                    marks={formData.marks}
                    questionNumber={1}
                    totalQuestions={100}
                  />
                </Box>
              )}
            </Box>
          )}

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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, color: 'primary.main' }}>
                            {String.fromCharCode(65 + index)}:
                          </Typography>
                          <MathRenderer 
                            content={option} 
                            variant="text"
                            sx={{ 
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        </Box>
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
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              editingQuestion ? 'Update Question' : 'Add Question'
            )}
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

      {/* Preview Dialog */}
      <Dialog 
        open={showPreviewDialog} 
        onClose={handleClosePreview} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Question Preview
          <Typography variant="subtitle2" color="text.secondary">
            This is how the question will appear in the actual exam
          </Typography>
        </DialogTitle>
        <DialogContent>
          {previewQuestion && (
            <ExamPreview
              question={previewQuestion.question}
              options={previewQuestion.options}
              subject={previewQuestion.subject}
              marks={previewQuestion.marks}
              questionNumber={1}
              totalQuestions={100}
              onClose={handleClosePreview}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};



export default QuestionManagement; 

