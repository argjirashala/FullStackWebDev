const { ApolloServer } = require('@apollo/server');
const { GraphQLError } = require('graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws');
const { PubSub } = require('graphql-subscriptions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { expressMiddleware } = require('@apollo/server/express4');

const JWT_SECRET = 'MYSECRETKEY';
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) =>
    console.error('Error connecting to MongoDB:', error.message)
  );

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  born: Number,
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
  },
  published: {
    type: Number,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  genres: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'A book must have at least one genre.',
    },
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
});

const Author = mongoose.model('Author', authorSchema);
const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);

const pubsub = new PubSub();

const authors = [
  { name: 'Robert Martin', born: 1952 },
  { name: 'Martin Fowler', born: 1963 },
  { name: 'Fyodor Dostoevsky', born: 1821 },
  { name: 'Joshua Kerievsky' },
  { name: 'Sandi Metz' },
];

const books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    genres: ['classic', 'crime'],
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    genres: ['classic', 'revolution'],
  },
];

const seedDatabase = async () => {
  try {
    await Author.deleteMany({});
    await Book.deleteMany({});
    const authorDocs = await Author.insertMany(authors);
    const authorMap = {};
    authorDocs.forEach((author) => {
      authorMap[author.name] = author._id;
    });

    const bookDocs = books.map((book) => ({
      ...book,
      author: authorMap[book.author],
    }));
    await Book.insertMany(bookDocs);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allGenres: [String!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (_, args) => {
      const filter = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        } else {
          return [];
        }
      }
      if (args.genre) {
        filter.genres = { $regex: args.genre, $options: 'i' };
      }
      return Book.find(filter).populate('author');
    },
    allGenres: async () => {
      const books = await Book.find({});
      const genresSet = new Set();
      books.forEach((book) => {
        book.genres.forEach((genre) => genresSet.add(genre));
      });
      return Array.from(genresSet);
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      return authors.map(async (author) => ({
        name: author.name,
        born: author.born,
        bookCount: await Book.countDocuments({ author: author._id }),
      }));
    },
    me: (_, __, { currentUser }) => currentUser,
  },
  Mutation: {
    addBook: async (
      _,
      { title, author: authorName, published, genres },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      let author = await Author.findOne({ name: authorName });
      if (!author) {
        author = new Author({ name: authorName });
        await author.save();
      }
      const book = new Book({
        title,
        published,
        genres,
        author: author._id,
      });
      await book.save();

      pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') });

      return book.populate('author');
    },
    editAuthor: async (_, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const author = await Author.findOne({ name });
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      author.born = setBornTo;
      await author.save();
      return author;
    },
    createUser: async (_, { username, favoriteGenre }) => {
      try {
        const user = new User({ username, favoriteGenre });
        await user.save();
        return user;
      } catch (error) {
        throw new GraphQLError('Error creating user: ' + error.message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user || password !== 'somepassword123') {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET
      );
      return { value: token };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator(['BOOK_ADDED']),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({ schema });

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json());

const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
useServer({ schema }, wsServer);

const startServer = async () => {
  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7);
          try {
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
          } catch {
            console.error('Invalid token');
          }
        }
        return {};
      },
    })
  );

  await seedDatabase();
  httpServer.listen(4000, () => {
    console.log('Server ready at http://localhost:4000');
    console.log('WebSocket Server ready at ws://localhost:4000/graphql');
  });
};

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
