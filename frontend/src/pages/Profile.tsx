import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, Typography, Layout } from "antd";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function Profile() {
  const { user } = useAuth();

  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <Content style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
      <Card style={{ width: 400 }}>
        <Title level={2}>User Profile</Title>
        <Paragraph><strong>Name:</strong> {user.name}</Paragraph>
        <Paragraph><strong>Email:</strong> {user.email}</Paragraph>
      </Card>
    </Content>
  );
}

export default Profile;
