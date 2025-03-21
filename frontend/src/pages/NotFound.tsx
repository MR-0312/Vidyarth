import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">
        <button
          style={{ marginTop: "1rem", padding: "0.6em 1.2em", fontSize: "1em" }}
        >
          Go to Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
