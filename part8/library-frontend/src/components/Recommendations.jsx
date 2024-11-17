import { useQuery, gql } from '@apollo/client';
import PropTypes from 'prop-types';

const ALL_BOOKS = gql`
  query AllBooks {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

const ME = gql`
  query Me {
    me {
      username
      favoriteGenre
    }
  }
`;

const Recommendations = ({ show }) => {
  const {
    data: booksData,
    loading: booksLoading,
    error: booksError,
  } = useQuery(ALL_BOOKS);
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME);

  if (!show) {
    return null;
  }

  if (booksLoading || meLoading) return <p>Loading...</p>;
  if (booksError || meError)
    return <p>Error: {booksError?.message || meError?.message}</p>;

  if (!meData || !meData.me) {
    return <p>No user information available.</p>;
  }

  const favoriteGenre = meData.me.favoriteGenre;

  if (!favoriteGenre) {
    return (
      <p>No favorite genre set. Update your profile to see recommendations.</p>
    );
  }

  const filteredBooks = booksData.allBooks.filter((book) =>
    book.genres.includes(favoriteGenre)
  );

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Recommendations.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default Recommendations;
