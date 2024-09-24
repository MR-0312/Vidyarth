import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Grid, Card, CardContent, CardMedia, Typography, TextField, Button, Pagination, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const booksPerPage = 9;

  useEffect(() => {
    fetchBooks();
  }, [currentPage, genre, sortBy]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books?page=${currentPage}&limit=${booksPerPage}&genre=${genre}&sort=${sortBy}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setBooks(res.data.books);
      setFilteredBooks(res.data.books);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const results = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm, books]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  return (
    <Container>
      <Grid container spacing={3} style={{ marginBottom: '1rem' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search books"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Genre</InputLabel>
            <Select value={genre} onChange={handleGenreChange} label="Genre">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="fiction">Fiction</MenuItem>
              <MenuItem value="non-fiction">Non-Fiction</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="history">History</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="createdAt">Date Added</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {filteredBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={book.coverImage}
                alt={book.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {book.author}
                </Typography>
                <Button component={Link} to={`/book/${book._id}`} variant="outlined" color="primary">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
}

export default Dashboard;