import { useState, useEffect } from 'react';
import Notification from './components/Notification';
import personService from './services/persons';

const Filter = ({ searchText, handleSearch }) => (
  <p>Filter shown with <input value={searchText} onChange={handleSearch} /></p>
);

const PersonForm = (props) => (
  <form onSubmit={props.addPerson}>
    <div>
      name: <input value={props.newName} onChange={props.handleNameChange} />
      number: <input value={props.newNumber} onChange={props.handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

const Person = (props) => (
  <p>
    {props.name} {props.number}
    <button onClick={() => props.handleDelete(props.id)}>Delete</button>
  </p>
)

const People = ({ personsArray, searchText, handleDelete }) => {
  return (
    <>
      {
        personsArray
          .filter(person => person.name.toLowerCase().includes(searchText.toLowerCase()))
          .map(person => (
            <Person key={person.id} id={person.id} name={person.name} number={person.number} handleDelete={handleDelete} />
          ))
      }
    </>
  )
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState({});

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      })
  }, []);

  const handleNameChange = evt => {
    setNewName(evt.target.value);
  }

  const handleNumberChange = evt => {
    setNewNumber(evt.target.value);
  }

  const handleSearch = evt => {
    setSearchText(evt.target.value);
    console.log(evt.target.value);
  }

  const addPerson = evt => {
    evt.preventDefault();
    const matches = persons.filter(person => person.name === newName);
    const personObj = {
      name: newName,
      number: newNumber
    }
    if (matches.length) {
      const person = matches[0];
      if (window.confirm(`${person.name} is already in the phonebook. Would you like to update their number?`)) {
        console.log('Update number functionality will be here');
        const id = person.id;
        const changedPerson = { ...person, number: newNumber };
        personService
          .update(id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== id ? person : returnedPerson));
            setMessage({
              content: `Number has been updated for ${returnedPerson.name}.`,
              messageType: 'success'
            });
            setTimeout(() => {
              setMessage({});
            }, 3000);
          })
          .catch(err => {
            setMessage({
              content: `Information for '${person.name}' has already been deleted from the server`,
              messageType: 'error'
            })
            setTimeout(() => {
              setMessage({});
            }, 3000);
            setPersons(persons.filter(p => p.id !== id));
          })
      }
    } else {
      personService
        .create(personObj)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');
          setMessage({
            content: `${returnedPerson.name} has been added to the phonebook`,
            messageType: 'success'
          });
          setTimeout(() => {
            setMessage({});
          }, 3000);
        })
    }

  }

  const deletePerson = id => {
    if (window.confirm('Are you sure')) {
      personService.deletePerson(id)
      setPersons(persons.filter(person => person.id !== id));
    }
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={message} />
      <Filter searchText={searchText} handleSearch={handleSearch} />
      <h2>Add new entry</h2>
      <PersonForm
        addPerson={addPerson}
        newName={newName} handleNameChange={handleNameChange}
        newNumber={newNumber} handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <People personsArray={persons} searchText={searchText} handleDelete={deletePerson} />
    </div>
  )
}

export default App;
