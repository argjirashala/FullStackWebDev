import { useState } from "react";
import PropTypes from "prop-types";

const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={onSubmit}>
        <div>
          Username
          <input
            id='username'
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password
          <input
            id='password'
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button id="login-button" type="submit">Login</button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default LoginForm;
