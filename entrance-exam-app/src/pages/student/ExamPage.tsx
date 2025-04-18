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
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Removed unused logout from useAuth if it isn't needed
// import { useAuth } from "../../contexts/AuthContext";

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
  const [questionStatus, setQuestionStatus] = useState<{
    [key: string]: QuestionStatus;
  }>({});

  // Function to shuffle an array
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoized organizeQuestionsBySubject so it doesn't get recreated on every render.
  const organizeQuestionsBySubject = useCallback((questions: Question[]) => {
    const subjects = Array.from(new Set(questions.map((q) => q.subject)));
    let organizedQuestions: Question[] = [];
    subjects.forEach((subject) => {
      const subjectQuestions = questions.filter((q) => q.subject === subject);
      organizedQuestions = [...organizedQuestions, ...shuffleArray(subjectQuestions)];
    });
    return organizedQuestions;
  }, []);

  // Function to group questions by subject
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

  // Memoized submission function to avoid unnecessary re-renders
  const handleSubmitExam = useCallback(async () => {
    try {
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
    }
  }, [examId, examState.answers]);

  // Fetch exam data on mount. Added organizeQuestionsBySubject and navigate to dependency array.
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const token = localStorage.getItem("token");
        const settingsResponse = await axios.get("/api/auth/exam-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examDuration = settingsResponse.data.examDurationMinutes;

        const examResponse = await axios.get("/api/exam-results", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!examResponse.data.success || !examResponse.data.results.length) {
          setError("No active exam found");
          navigate("/student");
          return;
        }

        const activeExam = examResponse.data.results.find((r: any) => !r.completed);
        if (!activeExam) {
          setError("No active exam found");
          navigate("/student");
          return;
        }

        setExamId(activeExam._id);

        const questionsResponse = await axios.get("/api/questions/exam", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (questionsResponse.data.success) {
          const organizedQuestions = organizeQuestionsBySubject(questionsResponse.data.questions);
          setExamState((prev) => ({
            ...prev,
            questions: organizedQuestions,
            currentSubject: organizedQuestions[0]?.subject || "",
            timeLeft: examDuration * 60, // Set time left based on settings
          }));

          // Initialize question status
          const initialStatus: { [key: string]: QuestionStatus } = {};
          organizedQuestions.forEach((q) => {
            initialStatus[q._id] = { answered: false, skipped: false };
          });
          setQuestionStatus(initialStatus);
        }
      } catch (error: any) {
        console.error("Error fetching exam data:", error);
        setError(error.response?.data?.message || "Error loading exam");
        navigate("/student");
      }
    };

    fetchExamData();
  }, [navigate, organizeQuestionsBySubject]);

  // Timer for the exam
  useEffect(() => {
    const timer = setInterval(() => {
      setExamState((prev) => {
        if (prev.timeLeft <= 0) {
          clearInterval(timer);
          handleSubmitExam();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitExam]);

  // Handle browser back button and refresh events
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (Object.keys(examState.answers).length > 0) {
        setShowAutoSubmitDialog(true);
      } else {
        setShowExitWarning(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examState.answers]);

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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
          <Typography variant="h6">Loading exam questions...</Typography>
                    {examState.currentSubject}
                  
                  <Typography variant="subtitle1">
                    Question {examState.currentQuestionIndex + 1} of {examState.questions.length}
                  </Typography>
                
                <Typography variant="h6" color={examState.timeLeft < 300 ? "error" : "inherit"}>
                  Time Left: {formatTime(examState.timeLeft)}
                </Typography>
              </Box>

              <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <FormLabel component="legend">
                  <Typography variant="h6" gutterBottom>
                    {currentQuestion.question}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={examState.answers[currentQuestion._id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button startIcon={<PrevIcon />} onClick={() => handleNavigate("prev")} disabled={examState.currentQuestionIndex === 0}>
                  Previous
                </Button>
                {examState.currentQuestionIndex === examState.questions.length - 1 ? (
                  <Button startIcon={<FlagIcon />} variant="contained" color="primary" onClick={() => setShowConfirmSubmit(true)}>
                    Submit Exam
                  </Button>
                ) : (
                  <Button endIcon={<NextIcon />} onClick={() => handleNavigate("next")} variant="contained">
                    Next
                  </Button>
                )}
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
            <Typography>Are you sure you want to submit your exam? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmitExam} variant="contained" color="primary">
              Submit
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