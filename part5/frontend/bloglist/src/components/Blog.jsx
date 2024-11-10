import { useState } from 'react';
import PropTypes from 'prop-types';

const Blog = ({ blog, updateBlog, user, handleDelete }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
  };

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id || blog.user,
    };
    updateBlog(blog.id, updatedBlog);
  };

  return (
    <div style={blogStyle} className="blog" data-testid={`blog-${blog.id}`}>
      <div className="blog-title">
        <span>{blog.title}</span>
        <span> {blog.author}</span>
        <button onClick={toggleDetails}>
          {detailsVisible ? 'hide' : 'view'}
        </button>
      </div>
      {detailsVisible && (
        <div className="blog-details">
          <p>{blog.url}</p>
          <p>
            likes {blog.likes}{' '}
            <button onClick={handleLike}>like</button>
          </p>
          <p>{blog.user.name}</p>
          {user.username === (blog.user.username || blog.user.name) && (
            <button onClick={() => handleDelete(blog)}>remove</button>
          )}
        </div>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ]).isRequired,
  }).isRequired,
  updateBlog: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default Blog;

