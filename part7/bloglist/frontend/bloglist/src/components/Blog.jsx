import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';

const Blog = ({ blog }) => {
  return (
    <Card className="mb-3" data-testid={`blog-${blog.id}`}>
      <Card.Body>
        <Card.Title>
          <Link
            to={`/blogs/${blog.id}`}
            className="text-decoration-none text-dark"
          >
            {blog.title} <small className="text-muted">by {blog.author}</small>
          </Link>
        </Card.Title>
      </Card.Body>
    </Card>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }).isRequired,
};

export default Blog;
