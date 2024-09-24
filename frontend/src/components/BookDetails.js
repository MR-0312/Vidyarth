import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, TextField } from '@material-ui/core';

function BookDetails() {
  const [book, setBook] = useState(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setBook(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/books/${id}/reviews`, { text: review }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      // Refresh book data
      const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setBook(res.data);
      setReview('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/books/${id}/ratings`, { rating }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      // Refresh book data
      const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setBook(res.data);
      setRating(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!book) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{book.title}</Typography>
      <Typography variant="h6" gutterBottom>{book.author}</Typography>
      <Typography variant="body1" paragraph>{book.description}</Typography>
      <Button variant="contained" color="primary" component={Link} to={`/read/${book._id}`}>
        Read Book
      </Button>

      <Typography variant="h5" gutterBottom>Reviews</Typography>
      {book.reviews.map((review, index) => (
        <Typography key={index} variant="body1" paragraph>{review.text}</Typography>
      ))}

      <form onSubmit={handleReviewSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Write a review"
          variant="outlined"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Review
        </Button>
      </form>

      <Typography variant="h5" gutterBottom>Rate this book</Typography>
      <form onSubmit={handleRatingSubmit}>
        <TextField
          type="number"
          margin="normal"
          label="Rating (1-5)"
          variant="outlined"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          inputProps={{ min: 1, max: 5 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Rating
        </Button>
      </form>
    </Container>
  );
}

export default BookDetails;