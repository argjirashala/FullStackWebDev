import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../NotificationContext'
import axios from 'axios'

const AnecdoteForm = () => {
  const [content, setContent] = useState('') 
  const queryClient = useQueryClient()
  const { dispatch } = useNotification()

  const newAnecdoteMutation = useMutation({
    mutationFn: async (newAnecdote) => {
      const response = await axios.post('http://localhost:3001/anecdotes', newAnecdote)
      return response.data
    },
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      dispatch({ type: 'SET_NOTIFICATION', payload: `Anecdote '${newAnecdote.content}' created` })

      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'An error occurred while adding the anecdote'

      dispatch({
        type: 'SET_NOTIFICATION',
        payload: errorMessage,
      })

      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    }
  })

  const onCreate = (event) => {
    event.preventDefault()

    if (content.length < 5) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'Anecdote must be at least 5 characters long',
      })

      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
      return
    }

    newAnecdoteMutation.mutate({ content, votes: 0 })
    setContent('') 
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input
          name="anecdote"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
