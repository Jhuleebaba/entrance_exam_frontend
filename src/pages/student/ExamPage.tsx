import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { NavigateNext as NextIcon, NavigateBefore as PrevIcon, Flag as FlagIcon, CheckCircle as CheckIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { performanceMonitor } from "../../utils/performance";
import MathRenderer from "../../components/MathRenderer";

interface Question {
  _id: string;
  question: string;
  options: string[];
  subject: string;
  marks: number;
}

interface QuestionWithIndex extends Question {
  index: number;
}

interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [key: string]: string };
  timeLeft: number;
  currentSubject: string;
}

interface QuestionStatus {
  answered: boolean;
  skipped: boolean;
}

const ExamPage = () => {
  const navigate = useNavigate();

  const [examId, setExamId] = useState<string>("");
  const [examState, setExamState] = useState<ExamState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeLeft: 7200,
    currentSubject: "",
  });
  const [error, setError] = useState("");
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showAutoSubmitDialog, setShowAutoSubmitDialog] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<{ [key: string]: QuestionStatus }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const organizeQuestionsBySubject = useCallback((questions: Question[]) => {
    const subjects = ['Mathematics', 'English', 'Verbal Reasoning', 'Quantitative Reasoning', 'General Paper'];
    let organizedQuestions: Question[] = [];
    subjects.forEach((subject) => {
      const subjectQuestions = questions.filter((q) => q.subject === subject);
      // Shuffle and take only 20 questions per subject
      const shuffledQuestions = shuffleArray(subjectQuestions).slice(0, 20);
      organizedQuestions = [...organizedQuestions, ...shuffledQuestions];
    });
    return organizedQuestions;
  }, []);

  const getQuestionsBySubject = () => {
    const grouped: { [key: string]: QuestionWithIndex[] } = {};
    examState.questions.forEach((question, index) => {
      if (!grouped[question.subject]) {
        grouped[question.subject] = [];
      }
      grouped[question.subject].push({ ...question, index });
    });
    return grouped;
  };

  const handleSubmitExam = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/exam-results/${examId}/submit`,
        { answers: examState.answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShowConfirmSubmit(false);
        setShowSuccessDialog(true);
      }
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      setError(error.response?.data?.message || "Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, examState.answers]);

  useEffect(() => {
    const fetchExamData = async () => {
      const stopTimer = performanceMonitor.startTimer('Exam Data Loading');
      
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No authentication token found. Please log in again.");
          navigate("/login");
          return;
        }

        // Use Promise.all to fetch data in parallel instead of sequential calls
        const apiTimer = performanceMonitor.startTimer('Parallel API Calls');
        const [settingsResponse, examResponse] = await Promise.all([
          axios.get("/api/auth/exam-settings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/exam-results", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        apiTimer();

        const examDuration = settingsResponse.data.examDurationMinutes || 120;
        
        if (!examResponse.data.success || !examResponse.data.results.length) {
          setError("No active exam found. Please start an exam from the dashboard.");
          navigate("/student");
          return;
        }
        
        const activeExam = examResponse.data.results.find((r: any) => !r.completed);
        if (!activeExam) {
          setError("No active exam found. Please start an exam from the dashboard.");
          navigate("/student");
          return;
        }
        
        setExamId(activeExam._id);
        
        // Check if we already have questions from exam start
        if (activeExam.questions && activeExam.questions.length > 0) {
          // Use existing questions from exam record
          const organizeTimer = performanceMonitor.startTimer('Organize Questions');
          const organizedQuestions = organizeQuestionsBySubject(activeExam.questions);
          organizeTimer();
          
          setExamState((prev) => ({
            ...prev,
            questions: organizedQuestions,
            currentSubject: organizedQuestions[0]?.subject || "",
            timeLeft: examDuration * 60,
          }));
          
          const initialStatus: { [key: string]: QuestionStatus } = {};
          organizedQuestions.forEach((q) => {
            initialStatus[q._id] = { answered: false, skipped: false };
          });
          setQuestionStatus(initialStatus);
        } else {
          // Fallback: fetch questions from questions endpoint
          const questionsTimer = performanceMonitor.startTimer('Fetch Questions API');
          const questionsResponse = await axios.get("/api/questions/exam", {
            headers: { Authorization: `Bearer ${token}` },
          });
          questionsTimer();
          
          if (questionsResponse.data.success) {
            const organizeTimer = performanceMonitor.startTimer('Organize Questions');
            const organizedQuestions = organizeQuestionsBySubject(questionsResponse.data.questions);
            organizeTimer();
            
            setExamState((prev) => ({
              ...prev,
              questions: organizedQuestions,
              currentSubject: organizedQuestions[0]?.subject || "",
              timeLeft: examDuration * 60,
            }));
            const initialStatus: { [key: string]: QuestionStatus } = {};
            organizedQuestions.forEach((q) => {
              initialStatus[q._id] = { answered: false, skipped: false };
            });
            setQuestionStatus(initialStatus);
          } else {
            throw new Error("Failed to load exam questions from server");
          }
        }
        
        // Log performance summary
        performanceMonitor.logReport();
        
      } catch (error: any) {
        console.error("Error fetching exam data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error loading exam";
        setError(errorMessage);
        
        // Don't navigate away immediately - give user a chance to retry
        setTimeout(() => {
          if (errorMessage.includes("No active exam")) {
            navigate("/student");
          }
        }, 3000);
      } finally {
        stopTimer();
      }
    };

    fetchExamData();
  }, [navigate, organizeQuestionsBySubject]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (examState.questions.length > 0) {
      timer = setInterval(() => {
        setExamState((prev) => {
          if (prev.timeLeft <= 0) {
            clearInterval(timer);
            handleSubmitExam();
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [handleSubmitExam, examState.questions.length]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your exam progress may be lost.";
    };
    
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (Object.keys(examState.answers).length > 0) {
        setShowAutoSubmitDialog(true);
      } else {
        setShowExitWarning(true);
      }
    };
    
    // Only add listeners if we have an active exam
    if (examState.questions.length > 0) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.pathname);
    }
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examState.answers, examState.questions.length]);

  const handleAnswerChange = (value: string) => {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    setExamState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion._id]: value },
    }));
    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion._id]: { ...prev[currentQuestion._id], answered: true, skipped: false },
    }));
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    if (!examState.answers[currentQuestion._id]) {
      setQuestionStatus((prev) => ({
        ...prev,
        [currentQuestion._id]: { ...prev[currentQuestion._id], skipped: true },
      }));
    }
    setExamState((prev) => {
      const newIndex =
        direction === "next"
          ? Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
          : Math.max(prev.currentQuestionIndex - 1, 0);
      return {
        ...prev,
        currentQuestionIndex: newIndex,
        currentSubject: prev.questions[newIndex]?.subject || prev.currentSubject,
      };
    });
  };

  const handleJumpToQuestion = (index: number) => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: index,
      currentSubject: prev.questions[index].subject,
    }));
  };

  const handleCancelExam = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/exam-results/${examId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/student");
    } catch (error: any) {
      console.error("Error cancelling exam:", error);
      setError(error.response?.data?.message || "Failed to cancel exam");
    }
  };

  const handleAutoSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/exam-results/${examId}/submit`,
        { answers: examState.answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShowSuccessDialog(true);
      }
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      setError(error.response?.data?.message || "Failed to submit exam");
    }
  };

  const handleSuccessClose = () => {
    navigate("/login");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getQuestionStatusColor = (index: number) => {
    const question = examState.questions[index];
    if (!question) return "default";
    const status = questionStatus[question._id];
    if (status?.answered) return "success";
    if (status?.skipped) return "warning";
    return "default";
  };

  const currentQuestion = examState.questions[examState.currentQuestionIndex];
  const progress = (examState.currentQuestionIndex / examState.questions.length) * 100;

  if (!currentQuestion) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Loading exam questions...
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, maxWidth: '100%', overflow: 'hidden', minHeight: '400px' }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {examState.currentSubject}
                  </Typography>
                  <Typography variant="subtitle1">
                    Question {examState.currentQuestionIndex + 1} of {examState.questions.length}
                  </Typography>
                </Box>
                <Typography variant="h6" color={examState.timeLeft < 300 ? "error" : "inherit"}>
                  Time Left: {formatTime(examState.timeLeft)}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
              <Box sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', pr: 1 }}>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <FormLabel component="legend">
                    <MathRenderer
                      content={currentQuestion.question}
                      variant="question"
                      sx={{ 
                        maxWidth: '100%',
                        pr: 2
                      }}
                    />
                  </FormLabel>
                  <RadioGroup 
                    value={examState.answers[currentQuestion._id] || ""} 
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    sx={{ mt: 2 }}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <FormControlLabel 
                        key={index} 
                        value={option} 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1, minWidth: '25px', color: 'primary.main' }}>
                              {String.fromCharCode(65 + index)}.
                            </Typography>
                            <MathRenderer
                              content={option}
                              variant="option"
                              sx={{ flex: 1 }}
                            />
                          </Box>
                        }
                        sx={{
                          alignItems: 'flex-start',
                          marginBottom: 1.5,
                          '& .MuiRadio-root': {
                            alignSelf: 'flex-start',
                            marginTop: '2px'
                          }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                  <Button 
                    startIcon={<PrevIcon />} 
                    onClick={() => handleNavigate("prev")} 
                    disabled={examState.currentQuestionIndex === 0}
                    variant="outlined"
                    sx={{ minWidth: '120px' }}
                  >
                    Previous
                  </Button>
                  {examState.currentQuestionIndex === examState.questions.length - 1 ? (
                    <Button 
                      startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckIcon />} 
                      variant="contained" 
                      color="success"
                      size="large"
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={isSubmitting}
                      sx={{ 
                        minWidth: '150px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                  ) : (
                    <Button 
                      endIcon={<NextIcon />} 
                      onClick={() => handleNavigate("next")} 
                      variant="contained"
                      sx={{ minWidth: '120px' }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question Navigation
              </Typography>
              {Object.entries(getQuestionsBySubject()).map(([subject, questions]) => (
                <Box key={`subject-${subject}`} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                    {subject}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {questions.map((question) => (
                      <Chip
                        key={`question-${question._id}`}
                        label={question.index + 1}
                        onClick={() => handleJumpToQuestion(question.index)}
                        color={getQuestionStatusColor(question.index)}
                        variant={examState.currentQuestionIndex === question.index ? "filled" : "outlined"}
                        sx={{ minWidth: "40px", cursor: "pointer" }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Legend:
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Chip label="Not Attempted" variant="outlined" size="small" />
                  <Chip label="Answered" color="success" size="small" />
                  <Chip label="Skipped" color="warning" size="small" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Dialog open={showConfirmSubmit} onClose={() => setShowConfirmSubmit(false)}>
          <DialogTitle>Submit Exam</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit your exam? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmSubmit(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitExam} 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showSuccessDialog} onClose={handleSuccessClose}>
          <DialogTitle>Exam Submitted</DialogTitle>
          <DialogContent>
            <Typography>You have successfully submitted this exam.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessClose} variant="contained" color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showExitWarning} onClose={() => setShowExitWarning(false)}>
          <DialogTitle>Warning</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to exit the exam? This will cancel your exam attempt and you will need to start over.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExitWarning(false)}>Continue Exam</Button>
            <Button onClick={handleCancelExam} variant="contained" color="error">
              Exit and Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showAutoSubmitDialog} onClose={() => setShowAutoSubmitDialog(false)}>
          <DialogTitle>Submit Exam</DialogTitle>
          <DialogContent>
            <Typography>
              You have answered some questions. The exam will be automatically submitted if you leave. Do you want to continue?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAutoSubmitDialog(false)}>Continue Exam</Button>
            <Button onClick={handleAutoSubmit} variant="contained" color="primary">
              Submit Now
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ExamPage;