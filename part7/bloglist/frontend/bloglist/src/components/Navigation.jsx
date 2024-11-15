import { NavLink } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const Navigation = ({ user, handleLogout }) => {
  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Navbar.Brand href="/">Blog App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={NavLink} to="/blogs">
            Blogs
          </Nav.Link>
          <Nav.Link as={NavLink} to="/users">
            Users
          </Nav.Link>
        </Nav>
        {user && (
          <Navbar.Text>
            Logged in as: <strong>{user.name}</strong>{' '}
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Text>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

Navigation.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  handleLogout: PropTypes.func.isRequired,
};

export default Navigation;
