const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const initialUser = new User({
    username: "root",
    name: "Superuser",
    passwordHash: await bcrypt.hash("secret", 10),
  });
  await initialUser.save();
});

test("creation succeeds with a fresh username", async () => {
  const usersAtStart = await User.find({});

  const newUser = {
    username: "mluukkai",
    name: "Matti Luukkainen",
    password: "salainen",
  };

  await api
    .post("/api/users")
    .send(newUser)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const usersAtEnd = await User.find({});
  expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

  const usernames = usersAtEnd.map((u) => u.username);
  expect(usernames).toContain(newUser.username);
});

test("creation fails with proper status code and message if username is taken", async () => {
  const usersAtStart = await User.find({});

  const newUser = {
    username: "root",
    name: "Superuser",
    password: "salainen",
  };

  const result = await api
    .post("/api/users")
    .send(newUser)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result.body.error).toContain("username must be unique");

  const usersAtEnd = await User.find({});
  expect(usersAtEnd).toHaveLength(usersAtStart.length);
});

test("creation fails with status code 400 if username or password is missing", async () => {
  const newUserWithoutPassword = {
    username: "newuser",
    name: "No Password User",
  };

  const result1 = await api
    .post("/api/users")
    .send(newUserWithoutPassword)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result1.body.error).toContain(
    "password must be at least 3 characters long"
  );

  const newUserWithoutUsername = {
    name: "No Username User",
    password: "validpassword",
  };

  const result2 = await api
    .post("/api/users")
    .send(newUserWithoutUsername)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result2.body.error).toContain(
    "username must be at least 3 characters long"
  );
});

test("creation fails with status code 400 if username or password is less than 3 characters", async () => {
  const newUserWithShortPassword = {
    username: "validusername",
    name: "Short Password User",
    password: "pw",
  };

  const result1 = await api
    .post("/api/users")
    .send(newUserWithShortPassword)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result1.body.error).toContain(
    "password must be at least 3 characters long"
  );

  const newUserWithShortUsername = {
    username: "ab",
    name: "Short Username User",
    password: "validpassword",
  };

  const result2 = await api
    .post("/api/users")
    .send(newUserWithShortUsername)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result2.body.error).toContain(
    "username must be at least 3 characters long"
  );
});

afterAll(async () => {
  await mongoose.connection.close();
});
