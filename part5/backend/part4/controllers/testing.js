const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");

const testingRouter = express.Router();

testingRouter.post("/reset", async (req, res) => {
  console.log("Debug reset endpoint hit");
  try {
    await Blog.deleteMany({});
    await User.deleteMany({});
    console.log("Database reset successfully");
    res.status(204).end();
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).send("Error resetting database");
  }
});

module.exports = testingRouter;
