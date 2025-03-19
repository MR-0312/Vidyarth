import React from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";

const { Header } = Layout;

function Headers() {
  return (
    <Header style={{ backgroundColor: "#313754", padding: "0" }}>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        style={{ backgroundColor: "#313754", color: "#ffe8c6" }}
      >
        <Menu.Item key="1">
          <Link to="/" style={{ color: "#ffe8c6" }}>Home</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/books" style={{ color: "#ffe8c6" }}>Books</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/login" style={{color: "#ffe8c6"}}>Login</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/register" style={{color: "#ffe8c6"}}>Register</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default Headers;
