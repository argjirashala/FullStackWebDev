import { render, screen, fireEvent } from '@testing-library/react';
import Blog from './Blog';
import { vi, test, expect } from 'vitest';

test('renders title and author but not url or likes by default', () => {
  const blog = {
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 42,
    user: { username: 'testuser', name: 'Test User' },
  };

  const mockUpdateBlog = vi.fn();
  const mockHandleDelete = vi.fn();

  render(
    <Blog
      blog={blog}
      updateBlog={mockUpdateBlog}
      user={{ username: 'testuser' }}
      handleDelete={mockHandleDelete}
    />
  );

  expect(screen.getByText('Test Blog Title')).toBeInTheDocument();
  expect(screen.getByText('Test Author')).toBeInTheDocument();

  expect(screen.queryByText('http://testblog.com')).not.toBeInTheDocument();
  expect(screen.queryByText('likes 42')).not.toBeInTheDocument();
});

test('renders URL and number of likes when the details button is clicked', () => {
  const blog = {
    id: '12345',
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 42,
    user: { username: 'testuser', name: 'Test User' },
  };

  const mockUpdateBlog = vi.fn();
  const mockHandleDelete = vi.fn();

  render(
    <Blog
      blog={blog}
      updateBlog={mockUpdateBlog}
      user={{ username: 'testuser' }}
      handleDelete={mockHandleDelete}
    />
  );

  expect(screen.queryByText('http://testblog.com')).toBeNull();
  expect(screen.queryByText(/likes 42/i)).toBeNull();

  const viewButton = screen.getByText('view');
  fireEvent.click(viewButton);

  expect(screen.getByText('http://testblog.com')).toBeInTheDocument();
  expect(screen.getByText(/likes 42/i)).toBeInTheDocument();
});

test('calls event handler twice when the like button is clicked twice', () => {
  const blog = {
    id: '12345',
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 42,
    user: { username: 'testuser', name: 'Test User' },
  };

  const mockUpdateBlog = vi.fn();

  render(
    <Blog
      blog={blog}
      updateBlog={mockUpdateBlog}
      user={{ username: 'testuser' }}
      handleDelete={() => {}}
    />
  );

  const viewButton = screen.getByText('view');
  fireEvent.click(viewButton);

  const likeButton = screen.getByText('like');
  fireEvent.click(likeButton);
  fireEvent.click(likeButton);

  expect(mockUpdateBlog).toHaveBeenCalledTimes(2);
});
