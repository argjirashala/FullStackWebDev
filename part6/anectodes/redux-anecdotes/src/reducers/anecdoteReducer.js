import { createSlice } from "@reduxjs/toolkit";
import {
  getAllAnecdotes,
  createNewAnecdote,
  updateAnecdote,
} from "../services/anectodes";
import { showNotification } from "./notificationReducer";

const anecdoteSlice = createSlice({
  name: "anecdotes",
  initialState: [],
  reducers: {
    setAnecdotes(state, action) {
      return action.payload;
    },
    appendAnecdote(state, action) {
      state.push(action.payload);
    },
    updateAnecdoteInStore(state, action) {
      const updatedAnecdote = action.payload;
      return state.map((anecdote) =>
        anecdote.id === updatedAnecdote.id ? updatedAnecdote : anecdote
      );
    },
  },
});

export const { setAnecdotes, appendAnecdote, updateAnecdoteInStore } =
  anecdoteSlice.actions;

export const initializeAnecdotes = () => async (dispatch) => {
  const anecdotes = await getAllAnecdotes();
  dispatch(setAnecdotes(anecdotes));
};

export const createAnecdote = (content) => async (dispatch) => {
  const newAnecdote = await createNewAnecdote(content);
  dispatch(appendAnecdote(newAnecdote));
  dispatch(showNotification(`new anecdote '${content}'`, 5));
};

export const voteForAnecdote = (id) => async (dispatch, getState) => {
  const anecdote = getState().anecdotes.find((a) => a.id === id);
  const updatedAnecdote = { ...anecdote, votes: anecdote.votes + 1 };
  const savedAnecdote = await updateAnecdote(updatedAnecdote);
  dispatch(updateAnecdoteInStore(savedAnecdote));
  dispatch(showNotification(`you voted '${anecdote.content}'`, 5));
};

export default anecdoteSlice.reducer;
