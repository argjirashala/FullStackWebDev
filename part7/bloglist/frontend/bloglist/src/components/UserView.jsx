import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import userService from '../services/users';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';

const UserView = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await userService.getById(id);
      setUser(fetchedUser);
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading user data...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">{user.name}</h2>
      <h3 className="mb-3">Added Blogs</h3>
      <ListGroup>
        {user.blogs.map((blog) => (
          <ListGroup.Item key={blog.id}>{blog.title}</ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default UserView;
