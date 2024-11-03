import React, { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  useEffect(() => {
    const results = countries.filter(country =>
      country.name.common.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCountries(results)
    setSelectedCountry(null)
    setWeather(null)
  }, [query, countries])

  useEffect(() => {
    if (filteredCountries.length === 1) {
      const country = filteredCountries[0]
      setSelectedCountry(country)
      fetchWeather(country.capital[0])
    }
  }, [filteredCountries]);

  const handleInputChange = (event) => {
    setQuery(event.target.value)
  }

  const fetchWeather = (city) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => {
        setWeather(response.data)
      })
      .catch(error => console.error("Error fetching weather data:", error))
  }

  return (
    <div>
      <label>find countries</label>
      <input value={query} onChange={handleInputChange} />

      {selectedCountry ? (
        <div>
          <h2>{selectedCountry.name.common}</h2>
          <p>capital {selectedCountry.capital[0]}</p>
          <p>area {selectedCountry.area}</p>
          <strong>languages:</strong>
          <ul>
            {Object.values(selectedCountry.languages).map((language, index) => (
              <li key={index}>{language}</li>
            ))}
          </ul>
          <img src={selectedCountry.flags.png} alt={`Flag of ${selectedCountry.name.common}`} width="100" />
          
          {weather && (
            <div>
              <h3>Weather in {selectedCountry.capital[0]}</h3>
              <p>temperature {weather.main.temp} Celsius</p>
              <p>wind {weather.wind.speed} m/s</p>
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                alt={weather.weather[0].description}
              />
            </div>
          )}
        </div>
      ) : filteredCountries.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : (
        <ul>
          {filteredCountries.map(country => (
            <li key={country.cca3}>
              {country.name.common}
              <button onClick={() => setFilteredCountries([country])}>show</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
