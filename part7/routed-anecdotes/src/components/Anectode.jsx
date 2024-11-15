import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

const Anecdote = ({ anecdotes }) => {
  const { id } = useParams();
  const anecdote = anecdotes.find((a) => a.id === Number(id));

  if (!anecdote) {
    return <p>Anecdote not found</p>;
  }

  return (
    <div>
      <h2>
        {anecdote.content} by {anecdote.author}
      </h2>
      <p>has {anecdote.votes} votes</p>
      <p>
        for more info see <a href={anecdote.info}>{anecdote.info}</a>
      </p>
    </div>
  );
};

Anecdote.propTypes = {
  anecdotes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      content: PropTypes.string.isRequired,
      author: PropTypes.string,
      info: PropTypes.string,
      votes: PropTypes.number,
    })
  ).isRequired,
};

export default Anecdote;
