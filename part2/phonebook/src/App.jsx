import { useState, useEffect } from 'react'
import axios from 'axios'
import FilterPeople from './components/FilterPeople'
import PersonForm from './components/PersonForm'
import People from './components/People'
import personsService from './services/persons'
import Notification  from './components/Notification'


const App = () => {
  const [people, setPeople] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterPeople, setFilterPeople] = useState('')
  const [notification, setNotification] = useState({ message: null, type: '' })

  useEffect(() => {
    personsService
      .getAll()
      .then(response => {
        setPeople(response)
      })
      .catch(error => {
        console.error("There was an error fetching the people:", error)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilterPeople(event.target.value)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification({ message: null, type: '' })
    }, 2500) 
  }

  const addPerson = (event) => {
    event.preventDefault()
    const existingPerson = people.find(person => person.name === newName)

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber }
        
        personsService
          .update(existingPerson.id, updatedPerson)
          .then(response => {
            setPeople(people.map(person => person.id !== existingPerson.id ? person : response))
            setNewName('')
            setNewNumber('')
            showNotification(`Updated ${newName}'s number`, 'success')
          })
          .catch(error => {
            console.error("There was an error updating the person:", error)
            showNotification(`Information of ${newName} has already been removed from server`, 'error')
            setPeople(people.filter(person => person.id !== existingPerson.id))
          })
      }
    } else {
      const personObject = { name: newName, number: newNumber }
      
      personsService
        .create(personObject)
        .then(response => {
          setPeople(people.concat(response))
          setNewName('')
          setNewNumber('')
          showNotification(`Added ${newName}`, 'success')
        })
        .catch(error => {
          console.error("There was an error adding the person:", error)
        })
    }
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personsService
        .remove(id)
        .then(() => {
          setPeople(people.filter(person => person.id !== id))
        })
        .catch(error => {
          console.error("There was an error deleting the person:", error)
        })
    }
  }

  const peopleToShow = people.filter(person => 
    person.name.toLowerCase().includes(filterPeople.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />
      <FilterPeople filter={filterPeople} handleFilterChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm 
        newName={newName} 
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <People people={peopleToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
