import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import MathRenderer from './MathRenderer';

interface ExamPreviewProps {
  question: string;
  options: string[];
  subject: string;
  marks: number;
  questionNumber?: number;
  totalQuestions?: number;
  onClose?: () => void;
}

const ExamPreview: React.FC<ExamPreviewProps> = ({
  question,
  options,
  subject,
  marks,
  questionNumber = 1,
  totalQuestions = 100,
  onClose
}) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string>('');

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(value);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <Paper sx={{ p: 3, maxWidth: '100%', overflow: 'hidden', minHeight: '400px' }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {subject}
            </Typography>
            <Typography variant="subtitle1">
              Question {questionNumber} of {totalQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Marks: {marks}
            </Typography>
          </Box>
          <Typography variant="h6" color="primary">
            Time Left: 02:00:00
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', pr: 1 }}>
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <FormLabel component="legend">
              <MathRenderer
                content={question}
                variant="question"
                sx={{ 
                  maxWidth: '100%',
                  pr: 2
                }}
              />
            </FormLabel>
            <RadioGroup 
              value={selectedAnswer} 
              onChange={(e) => handleAnswerChange(e.target.value)}
              sx={{ mt: 2 }}
            >
              {options.filter(option => option.trim()).map((option, index) => (
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
              variant="outlined"
              sx={{ minWidth: '120px' }}
              disabled
            >
              Previous
            </Button>
            <Button 
              endIcon={<NextIcon />} 
              variant="contained"
              sx={{ minWidth: '120px' }}
              disabled
            >
              Next
            </Button>
          </Box>
        </Box>
        
        {onClose && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              This is a preview of how the question will appear in the actual exam
            </Typography>
            <Button onClick={onClose} variant="outlined" size="small">
              Close Preview
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ExamPreview; 