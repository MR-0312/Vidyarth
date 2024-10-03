import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { currentUser, logout } = useAuth();

  return (
    <section className="profile">
      <h2>User Profile</h2>
      <p>Email: {currentUser.email}</p>
      <button onClick={logout}>Logout</button>
    </section>
  );
}

export default Profile;