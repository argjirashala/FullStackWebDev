import Person from './Person'

const People = ({ people, deletePerson }) => (
    <>
      {people.map(person => 
        <Person key={person.id} person={person} deletePerson={() => deletePerson(person.id, person.name)} />
      )}
    </>
)

export default People