const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>
          &copy; {new Date().getFullYear()} Vidhyarth eBook Reader. All rights
          reserved.
        </p>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
