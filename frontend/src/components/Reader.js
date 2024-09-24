import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, LinearProgress } from '@material-ui/core';
import { Bookmark, BookmarkBorder } from '@material-ui/icons';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

function Reader() {
  const [book, setBook] = useState(null);
  const [content, setContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const { id } = useParams();

  const fetchContent = useCallback(async (page) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${id}/content?page=${page}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      return res.data.content;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [id]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setBook(res.data);
        setTotalPages(res.data.totalPages);
        
        const progressRes = await axios.get(`http://localhost:5000/api/users/progress/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setCurrentPage(progressRes.data.currentPage || 1);
        setBookmarked(progressRes.data.bookmarked || false);

        const initialContent = await fetchContent(progressRes.data.currentPage || 1);
        setContent(initialContent);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id, fetchContent]);

  const loadMoreContent = useCallback(async () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      const newContent = await fetchContent(nextPage);
      setContent(prevContent => [...prevContent, ...newContent]);
      setCurrentPage(nextPage);
      await updateProgress(nextPage);
    }
  }, [currentPage, totalPages, fetchContent]);

  const updateProgress = async (page) => {
    try {
      await axios.post(`http://localhost:5000/api/users/progress/${id}`, 
        { currentPage: page },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async () => {
    try {
      await axios.post(`http://localhost:5000/api/users/bookmark/${id}`,
        { bookmarked: !bookmarked },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const Row = ({ index, style }) => (
    <div style={style}>
      <Typography variant="body1">{content[index]}</Typography>
    </div>
  );

  if (!book) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{book.title}</Typography>
      <Typography variant="h6" gutterBottom>{book.author}</Typography>
      <Button onClick={toggleBookmark}>
        {bookmarked ? <Bookmark /> : <BookmarkBorder />}
      </Button>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={content.length}
            itemSize={50}
            width={width}
            onItemsRendered={({ visibleStopIndex }) => {
              if (visibleStopIndex === content.length - 1) {
                loadMoreContent();
              }
            }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
      <LinearProgress variant="determinate" value={(currentPage / totalPages) * 100} />
      <Typography variant="body2" gutterBottom>Page {currentPage} of {totalPages}</Typography>
    </Container>
  );
}

export default Reader;