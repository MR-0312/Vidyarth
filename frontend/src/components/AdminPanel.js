import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, TextField, Grid, Paper } from '@material-ui/core';

function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'coverImage') {
      setCoverImage(e.target.files[0]);
    } else if (e.target.name === 'bookFile') {
      setBookFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newBook).forEach(key => formData.append(key, newBook[key]));
    formData.append('coverImage', coverImage);
    formData.append('bookFile', bookFile);

    try {
      await axios.post('http://localhost:5000/api/books', formData, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchBooks();
      setNewBook({ title: '', author: '', genre: '', description: '' });
      setCoverImage(null);
      setBookFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={newBook.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                name="author"
                value={newBook.author}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Genre (comma-separated)"
                name="genre"
                value={newBook.genre}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newBook.description}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="cover-image-upload"
                type="file"
                name="coverImage"
                onChange={handleFileChange}
              />
              <label htmlFor="cover-image-upload">
                <Button variant="contained" component="span">
                  Upload Cover Image
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} sm={6}>
              <input
                accept=".pdf,.epub"
                style={{ display: 'none' }}
                id="book-file-upload"
                type="file"
                name="bookFile"
                onChange={handleFileChange}
              />
              <label htmlFor="book-file-upload">
                <Button variant="contained" component="span">
                  Upload Book File
                </Button>
              </label>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Add Book
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Typography variant="h5" gutterBottom>Existing Books</Typography>
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Paper style={{ padding: '10px' }}>
              <Typography variant="h6">{book.title}</Typography>
              <Typography variant="body2">by {book.author}</Typography>
              <Button variant="outlined" color="secondary" onClick={() => {/* Implement delete functionality */}}>
                Delete
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AdminPanel;