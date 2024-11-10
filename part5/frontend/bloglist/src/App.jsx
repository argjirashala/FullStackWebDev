import { useState, useEffect, useRef } from 'react';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm'; 
import Blog from './components/Blog';
import Togglable from './components/Togglable';
import blogService from './services/blogs';
import loginService from './services/login';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: '' });

  const blogFormRef = useRef();

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogs = await blogService.getAll();
      setBlogs(blogs);
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials);
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setNotification({ message: `Welcome back, ${user.name}!`, type: 'success' });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
    } catch (error) {
      console.log(error)
      setNotification({ message: 'Wrong username or password', type: 'error' });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser');
    setUser(null);
    setNotification({ message: 'Logged out successfully', type: 'success' });
    setTimeout(() => setNotification({ message: null, type: '' }), 5000);
  };

  const handleBlogCreate = async (newBlog) => {
    try {
      const createdBlog = await blogService.create(newBlog);
      setBlogs(blogs.concat(createdBlog));
      setNotification({
        message: `A new blog "${createdBlog.title}" by ${createdBlog.author} added`,
        type: 'success',
      });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
      blogFormRef.current.toggleVisibility();
    } catch (error) {
      console.log(error)
      setNotification({ message: 'Failed to create blog', type: 'error' });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
    }
  };

  const updateBlog = async (id, updatedBlog) => {
    try {
      const returnedBlog = await blogService.update(id, updatedBlog);
      setBlogs(blogs.map((b) => (b.id !== id ? b : returnedBlog)));
      setNotification({ message: `Liked "${returnedBlog.title}"`, type: 'success' });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
    } catch (error) {
      console.log(error)
      setNotification({ message: 'Failed to like blog', type: 'error' });
      setTimeout(() => setNotification({ message: null, type: '' }), 5000);
    }
  };

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id);

        setBlogs(blogs.filter((b) => b.id !== blog.id));

        setNotification({
          message: `Blog "${blog.title}" removed successfully`,
          type: "success",
        });
      } catch (error) {
        console.error("Failed to delete blog:", error);
  
        const errorMessage =
          error.response?.status === 401
            ? "Unauthorized. Please make sure you are logged in as the creator of this blog."
            : `Failed to remove blog "${blog.title}"`;
  
        setNotification({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setTimeout(() => setNotification({ message: null, type: "" }), 5000);
      }
    }
  };
  

  return (
    <div>
      <Notification message={notification.message} type={notification.type || 'success'} />

      {user === null ? (
        <LoginForm handleLogin={handleLogin} />
      ) : (
        <div>
          <h2>blogs</h2>
          <p>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </p>
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm createBlog={handleBlogCreate} />
          </Togglable>
          {blogs
          .toSorted((a, b) => b.likes - a.likes) 
          .map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              updateBlog={updateBlog}
              user={user}
              handleDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
