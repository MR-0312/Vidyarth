import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Headers from "./components/Header";
import Footers from "./components/Footer";
import Home from "./pages/Home";
import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "antd";
import "./App.css";

const { Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout className="app">
          <Headers />
          <Content className="contentStyle">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Content>
          <Footers />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
