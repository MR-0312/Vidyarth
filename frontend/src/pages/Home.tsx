import React from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Button } from "antd";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function Home() {
  return (
    <Content style={{ textAlign: "center", padding: "50px" }}>
      <Title style={{ color: "#ffe8c6" }}>✨ Welcome to the Enchanted Library ✨</Title>
      <Paragraph style={{ color: "#72c5cc" }}>
        Discover mystical books, unravel legendary tales, and embark on magical journeys.
      </Paragraph>
      <Link to="/books">
        <Button type="primary" size="large" style={{ backgroundColor: "#ff5921", borderColor: "#ff5921" }}>
          Browse Books
        </Button>
      </Link>
    </Content>
  );
}

export default Home;
