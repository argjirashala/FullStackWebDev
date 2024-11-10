const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  let favorite = {};
  for (const blog of blogs) {
    if (!favorite.likes || blog.likes > favorite.likes) {
      favorite = blog;
    }
  }

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  const countBlog = {};
  for (const blog of blogs) {
    countBlog[blog.author] = (countBlog[blog.author] || 0) + 1;
  }

  let mostBlogsAuthor = "";
  let maxBlogs = 0;
  for (const [author, count] of Object.entries(countBlog)) {
    if (count > maxBlogs) {
      maxBlogs = count;
      mostBlogsAuthor = author;
    }
  }

  return {
    author: mostBlogsAuthor,
    blogs: countBlog[mostBlogsAuthor],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const countLikes = {};
  for (const blog of blogs) {
    countLikes[blog.author] = (countLikes[blog.author] || 0) + blog.likes;
  }

  let mostLikesAuthour = null;
  let maxLikes = 0;
  for (const [author, likes] of Object.entries(countLikes)) {
    if (likes > maxLikes) {
      maxLikes = likes;
      mostLikesAuthour = author;
    }
  }

  return {
    author: mostLikesAuthour,
    likes: maxLikes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
