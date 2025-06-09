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
      
      // Handle line breaks properly - convert newlines to <br> tags for simple text
      if (!cleanContent.includes('<') && !cleanContent.includes('>')) {
        // Plain text - just convert line breaks
        cleanContent = cleanContent.replace(/\n/g, '<br>');
      }
      
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
      
      // Handle common mathematical symbols and formatting (only if not already in HTML tags)
      cleanContent = cleanContent
        .replace(/(?<!<[^>]*)\^(\d+)(?![^<]*>)/g, '<sup>$1</sup>') // Superscript numbers
        .replace(/(?<!<[^>]*)_(\d+)(?![^<]*>)/g, '<sub>$1</sub>') // Subscript numbers
        .replace(/(?<!<[^>]*)\*\*(.*?)\*\*(?![^<]*>)/g, '<strong>$1</strong>') // Bold
        .replace(/(?<!<[^>]*)\*(.*?)\*(?![^<]*>)/g, '<em>$1</em>'); // Italic
      
      // Clean up multiple consecutive paragraphs
      cleanContent = cleanContent
        .replace(/<p><\/p>/g, '') // Remove empty paragraphs
        .replace(/<p>\s*<\/p>/g, '') // Remove paragraphs with only whitespace
        .replace(/(<\/p>\s*){2,}/g, '</p>') // Remove duplicate closing p tags
        .replace(/(<p>\s*){2,}/g, '<p>'); // Remove duplicate opening p tags
      
      // Remove dangerous HTML tags but preserve safe formatting
      cleanContent = cleanContent.replace(/<script.*?<\/script>/gi, '');
      cleanContent = cleanContent.replace(/<style.*?<\/style>/gi, '');
      cleanContent = cleanContent.replace(/javascript:/gi, '');
      cleanContent = cleanContent.replace(/on\w+\s*=/gi, '');
      
      return cleanContent;
    } catch (e) {
      console.warn('Error rendering math content:', e);
      // Fallback to simple text cleaning but preserve basic formatting
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
        .replace(/&#39;/g, "'");
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'question':
        return {
          fontSize: '1.2rem',
          fontWeight: 'bold',
          mb: 2,
          '& .katex': {
            fontSize: '1.3rem'
          },
          '& .katex-display': {
            margin: '0.8em 0'
          }
        };
      case 'option':
        return {
          fontSize: '1rem',
          '& .katex': {
            fontSize: '1rem'
          },
          '& .katex-display': {
            margin: '0.4em 0'
          }
        };
      default:
        return {
          '& .katex': {
            fontSize: 'inherit'
          }
        };
    }
  };

  return (
    <Box
      component={component}
      sx={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
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