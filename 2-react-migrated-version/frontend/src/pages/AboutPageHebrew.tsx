import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Navigation from '../components/Navigation';

const AboutPageHebrew: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom textAlign="center">
            אודות Wood Kits
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              מי אנחנו?
            </Typography>
            <Typography variant="body1" paragraph>
              Wood Kits היא חברה מובילה בתחום מוצרי עץ מותאמים אישית. אנו מתמחים ביצירת ערכות DIY איכותיות 
              המאפשרות לכם לבנות רהיטים ומוצרי עץ בבית, בקלות ובמקצועיות.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              החזון שלנו
            </Typography>
            <Typography variant="body1" paragraph>
              להפוך את הבנייה ביתית לנגישה, מהנה ואיכותית. אנו מאמינים שכל אחד יכול ליצור משהו יפה ופונקציונלי 
              עם הכלים והמדריכים הנכונים.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              המוצרים שלנו
            </Typography>
            <Typography variant="body1" paragraph>
              • ארונות ספרים מותאמים אישית
            </Typography>
            <Typography variant="body1" paragraph>
              • ספסלי גן וריהוט חוץ
            </Typography>
            <Typography variant="body1" paragraph>
              • מדרגות ותוספות בית
            </Typography>
            <Typography variant="body1" paragraph>
              • עציצים ומוצרי גינה
            </Typography>
            <Typography variant="body1" paragraph>
              • מיטות לחיות מחמד
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              יצירת קשר
            </Typography>
            <Typography variant="body1" paragraph>
              אנו כאן כדי לעזור! ליצירת קשר ושאלות נוספות:
            </Typography>
            <Typography variant="body1">
              📧 info@woodkits.co.il | 📞 03-1234567
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AboutPageHebrew;
