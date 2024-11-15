import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import { initializeBlogs, createBlog } from './store/blogsSlice';
import { setNotification, clearNotification } from './store/notificationSlice';
import { initializeUser, loginUser, logoutUser } from './store/userSlice';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UsersView from './components/UsersView';
import UserView from './components/UserView';
import BlogView from './components/BlogView';
import Navigation from './components/Navigation';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/esm/Container';

const App = () => {
  const dispatch = useDispatch();
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.user);

  const blogFormRef = useRef();

  useEffect(() => {
    dispatch(initializeBlogs());
    dispatch(initializeUser());
  }, [dispatch]);

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials));
      dispatch(setNotification({ message: 'Welcome back!', type: 'success' }));
      setTimeout(() => dispatch(clearNotification()), 5000);
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({
          message: 'Wrong username or password',
          type: 'error',
        })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(
      setNotification({ message: 'Logged out successfully', type: 'success' })
    );
    setTimeout(() => dispatch(clearNotification()), 5000);
  };

  const handleBlogCreate = async (newBlog) => {
    try {
      dispatch(createBlog(newBlog));
      dispatch(
        setNotification({
          message: `A new blog "${newBlog.title}" by ${newBlog.author} added`,
          type: 'success',
        })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
      blogFormRef.current.toggleVisibility();
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({ message: 'Failed to create blog', type: 'error' })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
    }
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <Navigation user={user} handleLogout={handleLogout} />
        <Notification />

        {user === null ? (
          <LoginForm handleLogin={handleLogin} />
        ) : (
          <div>
            <Routes>
              <Route
                path="/"
                element={
                  <div>
                    <h2>Welcome to the Blog App</h2>
                    <p>Use the menu above to navigate to Blogs or Users.</p>
                  </div>
                }
              />
              <Route
                path="/blogs"
                element={
                  <div>
                    <Container className="mt-4">
                      <h2 className="mb-4">Blogs</h2>
                      <Togglable
                        buttonLabel="Create New Blog"
                        ref={blogFormRef}
                      >
                        <BlogForm createBlog={handleBlogCreate} />
                      </Togglable>
                      <br />
                      <div className="d-flex flex-wrap gap-3">
                        {blogs.map((blog) => (
                          <Card
                            key={blog.id}
                            style={{ width: '18rem' }}
                            className="shadow-sm"
                          >
                            <Card.Body>
                              <Card.Title>
                                <Link
                                  to={`/blogs/${blog.id}`}
                                  className="text-decoration-none"
                                >
                                  {blog.title}
                                </Link>
                              </Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">
                                {blog.author}
                              </Card.Subtitle>
                              <Link to={`/blogs/${blog.id}`}>
                                <Button variant="primary" size="sm">
                                  View Blog
                                </Button>
                              </Link>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </Container>
                  </div>
                }
              />
              <Route path="/blogs/:id" element={<BlogView />} />
              <Route path="/users" element={<UsersView />} />
              <Route path="/users/:id" element={<UserView />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
