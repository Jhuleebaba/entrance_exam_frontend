import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Box, Typography } from '@mui/material';

interface MathRendererProps {
  content: string;
  variant?: 'question' | 'option' | 'text';
  component?: React.ElementType;
  sx?: any;
}

const MathRenderer: React.FC<MathRendererProps> = ({ 
  content, 
  variant = 'text', 
  component = 'div',
  sx = {} 
}) => {
  const renderMathContent = (content: string): string => {
    if (!content) return '';
    
    try {
      // Clean HTML entities first
      let cleanContent = content
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Handle line breaks properly - convert newlines to <br> tags
      cleanContent = cleanContent.replace(/\n/g, '<br>');
      
      // Handle KaTeX formulas (both inline and display)
      // Display math: $$formula$$
      cleanContent = cleanContent.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), { 
            displayMode: true,
            throwOnError: false,
            strict: false 
          });
        } catch (e) {
          console.warn('KaTeX display render error:', e);
          return `<span style="color: red;">[Math Error: ${formula}]</span>`;
        }
      });
      
      // Inline math: $formula$
      cleanContent = cleanContent.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), { 
            displayMode: false,
            throwOnError: false,
            strict: false 
          });
        } catch (e) {
          console.warn('KaTeX inline render error:', e);
          return `<span style="color: red;">[Math Error: ${formula}]</span>`;
        }
      });
      
      // Handle common mathematical symbols and formatting (avoid conflicts with existing HTML)
      // Only apply these patterns to text that doesn't already contain HTML tags
      if (!cleanContent.includes('<strong>') && !cleanContent.includes('<em>') && !cleanContent.includes('<u>')) {
        cleanContent = cleanContent
          .replace(/\^(\d+)/g, '<sup>$1</sup>') // Superscript numbers
          .replace(/_(\d+)/g, '<sub>$1</sub>') // Subscript numbers
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
      }
      
      // Enhanced HTML tag handling for existing content in database
      // Convert old HTML tags to proper formatting (in case they exist)
      cleanContent = cleanContent
        .replace(/<b>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>')
        .replace(/<i>/gi, '<em>')
        .replace(/<\/i>/gi, '</em>')
        .replace(/<br\s*\/?>/gi, '<br>')
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '<br>');
      
      // Clean up multiple consecutive paragraphs and breaks
      cleanContent = cleanContent
        .replace(/<br>\s*<br>\s*/g, '<br><br>') // Normalize double breaks
        .replace(/(<br>\s*){3,}/g, '<br><br>') // Limit to max 2 consecutive breaks
        .replace(/^\s*<br>\s*/g, '') // Remove leading breaks
        .replace(/\s*<br>\s*$/g, ''); // Remove trailing breaks
      
      // Remove dangerous HTML tags but preserve safe formatting
      cleanContent = cleanContent.replace(/<script.*?<\/script>/gi, '');
      cleanContent = cleanContent.replace(/<style.*?<\/style>/gi, '');
      cleanContent = cleanContent.replace(/javascript:/gi, '');
      cleanContent = cleanContent.replace(/on\w+\s*=/gi, '');
      
      return cleanContent;
    } catch (e) {
      console.warn('Error rendering math content:', e);
      // Enhanced fallback to clean and render basic formatting
      return content
        .replace(/<script.*?<\/script>/gi, '')
        .replace(/<style.*?<\/style>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<b>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>')
        .replace(/<i>/gi, '<em>')
        .replace(/<\/i>/gi, '</em>')
        .replace(/<br\s*\/?>/gi, '<br>');
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'question':
        return {
          fontSize: '1.3rem',
          fontWeight: 'bold',
          mb: 2,
          lineHeight: 1.6,
          color: 'text.primary',
          '& .katex': {
            fontSize: '1.4rem'
          },
          '& .katex-display': {
            margin: '1em 0'
          },
          '& strong': {
            fontWeight: 'bold'
          },
          '& em': {
            fontStyle: 'italic'
          },
          '& u': {
            textDecoration: 'underline'
          },
          '& sup': {
            fontSize: '0.8em',
            verticalAlign: 'super',
            lineHeight: 0
          },
          '& sub': {
            fontSize: '0.8em',
            verticalAlign: 'sub',
            lineHeight: 0
          }
        };
      case 'option':
        return {
          fontSize: '1.1rem',
          lineHeight: 1.5,
          '& .katex': {
            fontSize: '1.1rem'
          },
          '& .katex-display': {
            margin: '0.5em 0'
          },
          '& strong': {
            fontWeight: 'bold'
          },
          '& em': {
            fontStyle: 'italic'
          },
          '& u': {
            textDecoration: 'underline'
          },
          '& sup': {
            fontSize: '0.8em',
            verticalAlign: 'super',
            lineHeight: 0
          },
          '& sub': {
            fontSize: '0.8em',
            verticalAlign: 'sub',
            lineHeight: 0
          }
        };
      default:
        return {
          '& .katex': {
            fontSize: 'inherit'
          },
          '& strong': {
            fontWeight: 'bold'
          },
          '& em': {
            fontStyle: 'italic'
          },
          '& u': {
            textDecoration: 'underline'
          },
          '& sup': {
            fontSize: '0.8em',
            verticalAlign: 'super',
            lineHeight: 0
          },
          '& sub': {
            fontSize: '0.8em',
            verticalAlign: 'sub',
            lineHeight: 0
          }
        };
    }
  };

  return (
    <Box
      component={component}
      className="MathRenderer-root"
      sx={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-line',
        ...getVariantStyles(),
        ...sx
      }}
      dangerouslySetInnerHTML={{ 
        __html: renderMathContent(content) 
      }}
    />
  );
};

export default MathRenderer; 