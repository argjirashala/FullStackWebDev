import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import PropTypes from 'prop-types';

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, { error }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value;
      setToken(token);
      localStorage.setItem('library-token', token);
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login({ variables: { username, password } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          name
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
};

LoginForm.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default LoginForm;
