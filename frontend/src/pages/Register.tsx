import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Input, Button, Card, Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      navigate('/login');
    } catch (error) {
      console.error('Failed to register', error);
      // Handle registration error (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
      <Card style={{ width: 400 }}>
        <Title level={2}>Register</Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter your name" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>
      </Card>
    </Content>
  );
}

export default Register;
