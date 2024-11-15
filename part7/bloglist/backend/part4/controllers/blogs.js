const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
  });
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized access' });
  }

  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, user } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes, user },
      { new: true, runValidators: true }
    ).populate('user', { username: 1, name: 1 });

    if (!updatedBlog) {
      return response.status(404).json({ error: 'blog not found' });
    }

    response.json(updatedBlog);
  } catch (error) {
    console.error(error.message);
    response.status(400).json({ error: 'invalid blog data' });
  }
});

blogsRouter.post('/', async (request, response) => {
  const user = request.user;

  if (!user) {
    return response.status(401).json({ error: 'authentication required' });
  }

  const { title, url } = request.body;

  if (!title || !url) {
    return response
      .status(400)
      .json({ error: 'title and url must be provided' });
  }

  const blog = new Blog({
    ...request.body,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  blog.comments = blog.comments.concat(comment);
  const updatedBlog = await blog.save();

  res.status(201).json(updatedBlog);
});

module.exports = blogsRouter;
