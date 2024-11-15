const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
];

let token;

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);

  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'testpassword',
  };

  const anotherUser = {
    username: 'miri',
    name: 'Miri User',
    password: 'miri1234',
  };
  await api.post('/api/users').send(anotherUser);

  await api.post('/api/users').send(newUser);

  const loginResponse = await api.post('/api/login').send({
    username: newUser.username,
    password: newUser.password,
  });

  token = loginResponse.body.token;
});

describe('GET /api/blogs', () => {
  test('returns the correct amount of blog posts in JSON format', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('blog posts are returned with id field instead of _id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = response.body;
    blogs.forEach((blog) => {
      expect(blog.id).toBeDefined();
      expect(blog._id).not.toBeDefined();
    });
  });
});

describe('POST /api/blogs', () => {
  test('a valid blog post can be added with valid token', async () => {
    const newBlog = {
      title: 'Test Driven Development',
      author: 'Kent Beck',
      url: 'https://example.com/tdd',
      likes: 3,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);

    const contents = blogsAtEnd.map((b) => ({
      title: b.title,
      author: b.author,
      url: b.url,
      likes: b.likes,
    }));
    expect(contents).toContainEqual(newBlog);
  });

  test('fails with status code 401 if no token is provided', async () => {
    const newBlog = {
      title: 'Unauthorized Blog Post',
      author: 'Unauthorized Author',
      url: 'https://unauthorizedurl.com',
    };

    await api.post('/api/blogs').send(newBlog).expect(401);
  });

  test('blog post without likes defaults to 0', async () => {
    const newBlog = {
      title: 'New Blog Without Likes',
      author: 'Unknown Author',
      url: 'https://example.com/no-likes',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const savedBlog = response.body;
    expect(savedBlog.likes).toBe(0);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  });

  test('fails with status code 400 if title is missing', async () => {
    const newBlog = {
      author: 'No Title Author',
      url: 'https://example.com/no-title',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect({ error: 'title and url must be provided' });
  });

  test('fails with status code 400 if url is missing', async () => {
    const newBlog = {
      title: 'Missing URL Blog',
      author: 'No URL Author',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect({ error: 'title and url must be provided' });
  });
});

describe('DELETE /api/blogs', () => {
  const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
  };
  const loginUser = {
    username: 'testuser',
    password: 'testpassword',
  };
  const newBlog = {
    title: 'Testing',
    author: 'Test Test',
    url: 'http://testing',
    likes: 3,
  };
  test('should succeed with status code 204 if id is valid', async () => {
    const blogsAtStart = await blogsInDb();
    const loggedUser = await api.post('/api/login').send(loginUser);
    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${loggedUser.body.token}`)
      .send(newBlog);
    const blogsAfterAddition = await blogsInDb();

    await api
      .delete(`/api/blogs/${response.body.id}`)
      .set('authorization', `Bearer ${loggedUser.body.token}`)
      .expect(204);
    const blogsAtEnd = await blogsInDb();

    expect(blogsAfterAddition).toHaveLength(blogsAtStart.length + 1);
    expect(blogsAtEnd).toHaveLength(blogsAfterAddition.length - 1);
  });

  test('should return 404 if blog does not exist', async () => {
    const loggedUser = await api.post('/api/login').send(loginUser);

    const nonExistentId = '5f5c7d9f8f9d7b1c2c4d7a1b';
    await api
      .delete(`/api/blogs/${nonExistentId}`)
      .set('Authorization', `Bearer ${loggedUser.body.token}`)
      .expect(404)
      .expect((response) => {
        expect(response.body.error).toBe('Blog not found');
      });
  });

  test('should return 401 if token is invalid', async () => {
    const invalidToken = 'Bearer invalid.token.here';
    const nonExistentId = '5f5c7d9f8f9d7b1c2c4d7a1b';

    await api
      .delete(`/api/blogs/${nonExistentId}`)
      .set('Authorization', invalidToken)
      .expect(401)
      .expect((response) => {
        expect(response.body.error).toBe('token invalid');
      });
  });

  test('should return 401 if user is not authorized', async () => {
    const loggedUser = await api.post('/api/login').send(loginUser);

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loggedUser.body.token}`)
      .send(newBlog);

    const anotherUser = {
      username: 'miri',
      password: 'miri1234',
    };

    const anotherLoggedUser = await api.post('/api/login').send(anotherUser);

    await api
      .delete(`/api/blogs/${response.body.id}`)
      .set('Authorization', `Bearer ${anotherLoggedUser.body.token}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.error).toBe('unauthorized access');
      });
  });
});

test('successfully updates likes for a blog post', async () => {
  const blogsAtStart = await Blog.find({});
  const blogToUpdate = blogsAtStart[0];
  const newLikes = blogToUpdate.likes + 1;

  const response = await api
    .put(`/api/blogs/${blogToUpdate._id.toString()}`)
    .send({ likes: newLikes })
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body.likes).toBe(newLikes);

  const updatedBlogInDb = await Blog.findById(blogToUpdate._id);
  expect(updatedBlogInDb.likes).toBe(newLikes);
});

test('returns 404 if the blog post to update does not exist', async () => {
  const nonExistingId = new mongoose.Types.ObjectId();
  await api
    .put(`/api/blogs/${nonExistingId}`)
    .send({ likes: 10 })
    .set('Authorization', `Bearer ${token}`)
    .expect(404);
});

afterAll(async () => {
  await mongoose.connection.close();
});
