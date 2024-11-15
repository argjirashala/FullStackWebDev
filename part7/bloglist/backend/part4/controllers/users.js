const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
  });
  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
  });
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
});

module.exports = usersRouter;

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password must be at least 3 characters long' });
  }

  if (!username || username.length < 3) {
    return response
      .status(400)
      .json({ error: 'username must be at least 3 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      response.status(400).json({ error: 'username must be unique' });
    } else {
      next(error);
    }
  }
});

module.exports = usersRouter;
