import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Divider } from '@material-ui/core';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setUser(userRes.data);

        const historyRes = await axios.get('http://localhost:5000/api/users/reading-history', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setReadingHistory(historyRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>User Profile</Typography>
      <Typography variant="h6">Username: {user.username}</Typography>
      <Typography variant="body1">Email: {user.email}</Typography>

      <Typography variant="h5" style={{ marginTop: '2rem' }}>Reading History</Typography>
      <List>
        {readingHistory.map((item, index) => (
          <React.Fragment key={item._id}>
            <ListItem>
              <ListItemText
                primary={item.book.title}
                secondary={`Last read: ${new Date(item.lastReadAt).toLocaleDateString()}`}
              />
            </ListItem>
            {index < readingHistory.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}

export default UserProfile;