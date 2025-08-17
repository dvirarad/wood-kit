import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  date: string;
  productId: string;
}

interface ReviewSystemProps {
  productId: string;
  productName: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    message: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load reviews for this product
  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // For now, use localStorage to store reviews
      // In production, this would be an API call
      const storedReviews = localStorage.getItem(`reviews_${productId}`);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.name.trim() || !newReview.message.trim()) {
      setError('אנא מלא את כל השדות הנדרשים');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const review: Review = {
        id: Date.now().toString(),
        name: newReview.name.trim(),
        rating: newReview.rating,
        message: newReview.message.trim(),
        date: new Date().toISOString(),
        productId
      };

      const updatedReviews = [review, ...reviews];
      setReviews(updatedReviews);
      
      // Store in localStorage (in production, this would be an API call)
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews));

      setSuccess('הביקורת נוספה בהצלחה!');
      setDialogOpen(false);
      setNewReview({ name: '', rating: 5, message: '' });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('שגיאה בשמירת הביקורת');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Reviews Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            ביקורות על {productName}
          </Typography>
          {reviews.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={calculateAverageRating()} readOnly precision={0.1} />
              <Typography variant="body2" color="text.secondary">
                ({reviews.length} ביקורות)
              </Typography>
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ minWidth: 120 }}
        >
          הוסף ביקורת
        </Button>
      </Box>

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין ביקורות עדיין
          </Typography>
          <Typography variant="body2" color="text.secondary">
            היה הראשון לכתוב ביקורת על המוצר הזה
          </Typography>
        </Card>
      ) : (
        <List sx={{ width: '100%' }}>
          {reviews.map((review, index) => (
            <Box key={review.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {review.name}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.date)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                      {review.message}
                    </Typography>
                  }
                />
              </ListItem>
              {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
            </Box>
          ))}
        </List>
      )}

      {/* Add Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { direction: 'rtl' } }}
      >
        <DialogTitle>הוסף ביקורת חדשה</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="שם"
            fullWidth
            variant="outlined"
            value={newReview.name}
            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ mb: 2 }}>
            <Typography component="legend" gutterBottom>
              דירוג
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(_, newValue) => {
                setNewReview({ ...newReview, rating: newValue || 5 });
              }}
              size="large"
            />
          </Box>

          <TextField
            margin="dense"
            label="הודעה"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newReview.message}
            onChange={(e) => setNewReview({ ...newReview, message: e.target.value })}
            placeholder="כתוב את הביקורת שלך כאן..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'שולח...' : 'שלח ביקורת'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSystem;