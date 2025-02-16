import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Layout } from "antd";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
}

function BookDetails() {
  const [book, setBook] = useState<Book | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setBook({
      id: id || "1",
      title: "Mystical Tales of Eldoria",
      author: "Aldwin Nightshade",
      description:
        "A legendary tale set in the mystical lands of Eldoria, where heroes rise and magic flows freely.",
      coverImage: "https://via.placeholder.com/200x300",
    });
  }, [id]);

  if (!book) return <div>Loading...</div>;

  return (
    <Content style={{ padding: "20px" }}>
      <Card
        style={{ maxWidth: 800, margin: "auto", textAlign: "center", backgroundColor: "#72c5cc" }}
        cover={<img src={book.coverImage} alt={book.title} />}
      >
        <Title style={{ color: "#313754" }}>{book.title}</Title>
        <Paragraph strong style={{ color: "#313754" }}>By {book.author}</Paragraph>
        <Paragraph style={{ color: "#313754" }}>{book.description}</Paragraph>
        <Button type="primary" size="large" style={{ backgroundColor: "#ff5921", borderColor: "#ff5921" }}>
          Start Reading
        </Button>
      </Card>
    </Content>
  );
}

export default BookDetails;
