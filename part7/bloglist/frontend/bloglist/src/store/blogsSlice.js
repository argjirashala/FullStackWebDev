import { createSlice } from '@reduxjs/toolkit';
import blogService from '../services/blogs';

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload;
    },
    appendBlog(state, action) {
      state.push(action.payload);
    },
  },
});

export const { setBlogs, appendBlog } = blogsSlice.actions;

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const createBlog = (newBlog) => {
  return async (dispatch) => {
    const createdBlog = await blogService.create(newBlog);
    dispatch(appendBlog(createdBlog));
  };
};

export const updateBlog = (id, updatedBlog) => {
  return async (dispatch, getState) => {
    const returnedBlog = await blogService.update(id, updatedBlog);
    const currentBlogs = getState().blogs;
    const updatedBlogs = currentBlogs.map((b) =>
      b.id !== id ? b : returnedBlog
    );
    dispatch(setBlogs(updatedBlogs));
  };
};

export const likeBlog = (id, updatedBlog) => {
  return async (dispatch, getState) => {
    const returnedBlog = await blogService.update(id, updatedBlog);
    const currentBlogs = getState().blogs;
    const updatedBlogs = currentBlogs.map((b) =>
      b.id !== id ? b : returnedBlog
    );
    dispatch(setBlogs(updatedBlogs));
  };
};

export const deleteBlog = (id) => {
  return async (dispatch, getState) => {
    try {
      await blogService.remove(id);
      dispatch(setBlogs(getState().blogs.filter((b) => b.id !== id)));
    } catch (error) {
      console.error(
        'Error deleting blog:',
        error.response?.data || error.message
      );
    }
  };
};

export default blogsSlice.reducer;
