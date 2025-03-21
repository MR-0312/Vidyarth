import BookCarousel from './BookCarousel';

const BookShelf = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>📚 Explore Our Collection</h2>
      <BookCarousel />
    </div>
  );
};

export default BookShelf;