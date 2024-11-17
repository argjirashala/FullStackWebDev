import { useState } from 'react';
import { useQuery, gql, useSubscription } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Recommendations from './components/Recommendations';
import LoginForm from './components/LoginForm';

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
    }
  }
`;

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(localStorage.getItem('library-token'));

  const { data: authorData, refetch: refetchAuthors } = useQuery(ALL_AUTHORS);
  const { data: bookData, refetch: refetchBooks } = useQuery(ALL_BOOKS);

  const { error } = useSubscription(BOOK_ADDED, {
    onData: ({ client, data }) => {
      console.log('Subscription data received:', data);

      const bookAdded = data?.data?.bookAdded;

      if (bookAdded) {
        alert(`New Book Added: ${bookAdded.title} by ${bookAdded.author.name}`);

        client.cache.updateQuery(
          {
            query: ALL_BOOKS,
          },
          (existingData) => {
            return {
              ...existingData,
              allBooks: [...existingData.allBooks, bookAdded],
            };
          }
        );
      } else {
        console.warn('Subscription data is missing or invalid:', data);
      }
    },
  });
  if (error) {
    console.error('Subscription error:', error.message, error);
  }

  const logout = () => {
    setToken(null);
    localStorage.removeItem('library-token');
    setPage('authors');
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors
        show={page === 'authors'}
        authors={authorData?.allAuthors || []}
      />
      <Books show={page === 'books'} books={bookData?.allBooks || []} />
      {token && (
        <>
          <NewBook
            show={page === 'add'}
            refetchBooks={refetchBooks}
            refetchAuthors={refetchAuthors}
          />
          <Recommendations show={page === 'recommend'} />
        </>
      )}
      {!token && page === 'login' && <LoginForm setToken={setToken} />}
    </div>
  );
};

export default App;
