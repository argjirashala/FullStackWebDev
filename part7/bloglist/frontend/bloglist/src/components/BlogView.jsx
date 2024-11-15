import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../services/blogs';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from '../store/notificationSlice';
import { deleteBlog } from '../store/blogsSlice';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

const BlogView = () => {
  const [blog, setBlog] = useState(null);
  const [comment, setComment] = useState('');
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      const fetchedBlog = await blogService.getById(id);
      setBlog(fetchedBlog);
    };
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    try {
      const updatedBlog = {
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes + 1,
        user: blog.user.id || blog.user,
      };
      const savedBlog = await blogService.update(blog.id, updatedBlog);
      setBlog(savedBlog);
    } catch (error) {
      console.error(
        'Error liking the blog:',
        error.response?.data || error.message
      );
      dispatch(
        setNotification({ message: 'Failed to like blog', type: 'error' })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove "${blog.title}"?`)) {
      try {
        dispatch(deleteBlog(blog.id));
        dispatch(
          setNotification({
            message: `Blog "${blog.title}" removed successfully`,
            type: 'success',
          })
        );
        setTimeout(() => dispatch(clearNotification()), 5000);
        navigate('/blogs');
      } catch (error) {
        console.error(
          'Error deleting the blog:',
          error.response?.data || error.message
        );
        dispatch(
          setNotification({
            message: 'Failed to delete blog',
            type: 'error',
          })
        );
        setTimeout(() => dispatch(clearNotification()), 5000);
      }
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    try {
      const updatedBlog = await blogService.addComment(blog.id, { comment });
      setBlog(updatedBlog);
      setComment('');
      dispatch(setNotification({ message: 'Comment added!', type: 'success' }));
      setTimeout(() => dispatch(clearNotification()), 5000);
    } catch (error) {
      console.error(
        'Error adding comment:',
        error.response?.data || error.message
      );
      dispatch(
        setNotification({ message: 'Failed to add comment', type: 'error' })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
    }
  };

  if (!blog) {
    return <div>Loading blog data...</div>;
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>
          {blog.title} <small className="text-muted">by {blog.author}</small>
        </Card.Title>
        <Card.Subtitle className="mb-3">
          <a href={blog.url} target="_blank" rel="noopener noreferrer">
            {blog.url}
          </a>
        </Card.Subtitle>
        <div className="mb-3">
          <strong>{blog.likes} likes</strong>{' '}
          <Button variant="success" size="sm" onClick={handleLike}>
            Like
          </Button>
        </div>
        <div className="mb-3">
          <em>Added by {blog.user.name}</em>
        </div>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Remove
        </Button>
      </Card.Body>
      <Card.Footer>
        <h5>Comments</h5>
        <ListGroup className="mb-3">
          {blog.comments.map((comment, index) => (
            <ListGroup.Item key={index}>{comment}</ListGroup.Item>
          ))}
        </ListGroup>
        <Form onSubmit={handleAddComment} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Add a comment"
            value={comment}
            onChange={({ target }) => setComment(target.value)}
            className="me-2"
          />
          <Button type="submit" variant="primary">
            Add Comment
          </Button>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default BlogView;
