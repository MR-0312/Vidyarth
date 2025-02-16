import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Typography, Layout } from "antd";

const { Title } = Typography;
const { Content } = Layout;

interface Book {
  id: number;
  title: string;
  author: string;
}

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    setBooks([
      { id: 1, title: "Mystical Tales of Eldoria", author: "Aldwin Nightshade" },
      { id: 2, title: "Chronicles of the Enchanted Realm", author: "Seraphina Moon" },
      { id: 3, title: "The Sorcerer's Last Wish", author: "Malakai Stormborn" },
    ]);
  }, []);

  return (
    <Content style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", color: "#ffe8c6" }}>
        Fantasy Book Collection
      </Title>
      <Row gutter={[16, 16]} justify="center">
        {books.map((book) => (
          <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
            <Card 
              title={book.title} 
              bordered={false} 
              style={{ backgroundColor: "#72c5cc", color: "#313754" }}
            >
              <p style={{ color: "#313754" }}>By {book.author}</p>
              <Link to={`/books/${book.id}`} style={{ color: "#ff5921" }}>
                View Details
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </Content>
  );
}

export default BookList;
