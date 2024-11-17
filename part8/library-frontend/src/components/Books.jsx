import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';
import PropTypes from 'prop-types';

const ALL_BOOKS = gql`
  query AllBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

const ALL_GENRES = gql`
  query {
    allGenres
  }
`;

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
  });
  const { data: genreData } = useQuery(ALL_GENRES);

  if (!props.show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const books = data.allBooks;

  const handleGenreSelection = (genre) => {
    setSelectedGenre(genre);
    refetch({ genre });
  };

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((b, index) => (
            <tr key={b.id || `${b.title}-${index}`}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genreData?.allGenres.map((genre) => (
          <button key={genre} onClick={() => handleGenreSelection(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => handleGenreSelection(null)}>all genres</button>
      </div>
    </div>
  );
};

Books.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default Books;
