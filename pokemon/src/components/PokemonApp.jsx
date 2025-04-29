import React, { useState, useEffect } from 'react';
import './pokemon.css'

const PokemonApp = () => {
  const [pokemons, setPokemons] = useState([]);
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 150;
  

  useEffect(() => {
    loadMorePokemons();
  }, []);
  
 
  useEffect(() => {
    setPokemons([]);
    setOffset(0);
    loadMorePokemons();
  }, [typeFilter, searchQuery]);
  
  const fetchPokemons = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const pokemonPromises = data.results.map(pokemon => 
        fetch(pokemon.url)
          .then(res => {
            if (!res.ok) throw new Error(`Error fetching ${pokemon.name}`);
            return res.json();
          })
          .catch(error => {
            console.error(`Failed to fetch ${pokemon.name}:`, error);
            return null;
          })
      );
      
      const pokemonDetails = await Promise.all(pokemonPromises);
      
    
      return pokemonDetails
        .filter(pokemon => pokemon !== null)
        .filter(pokemon => {
          const matchesType = typeFilter ? pokemon.types.some(type => type.type.name === typeFilter) : true;
          const matchesSearch = pokemon.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesType && matchesSearch;
        });
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      setError('Failed to load Pokémon. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const loadMorePokemons = async () => {
    const newPokemons = await fetchPokemons();
    setPokemons(prevPokemons => [...prevPokemons, ...newPokemons]);
    setOffset(prevOffset => prevOffset + limit);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
  };
    
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="pokemon-app">
      <div className="header">
        <h1>Pokémon</h1>
      </div>
      
      <div className="controls">
        <select 
          id="type-filter" 
          onChange={handleTypeFilter} 
          value={typeFilter}
        >
          <option value="">All Types</option>
          {['normal', 'fire', 'water', 'grass', 'poison', 'flying', 'bug', 'electric', 'ground', 'fairy', 'fighting', 'psychic', 'rock', 'steel', 'ice', 'ghost', 'dragon', 'dark'].map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
        
        <input
          type="text"
          id="search-input"
          placeholder="Search Pokémon"
          onChange={handleSearch}
          value={searchQuery}
        />
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="loading">
          Loading Pokémon...
        </div>
      )}
      
      {!loading && pokemons.length === 0 && !error && (
        <div className="no-results">
          No Pokémon found. Try adjusting your filters.
        </div>
      )}
      
      <div className="container">
        {pokemons.map(pokemon => (
          <div key={pokemon.id} className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</div>
                <img 
                  src={pokemon.sprites.other['official-artwork'].front_default || 
                       `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = pokemon.sprites.front_default || 
                      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
                  }}
                />
                <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map(type => (
                    <span key={type.type.name} className={`type ${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flip-card-back">
                <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <div className="pokemon-stats">
                  {pokemon.stats.map(stat => (
                    <div key={stat.stat.name} className="stat-row">
                      <span className="stat-name">
                        {stat.stat.name.replace('-', ' ')}:
                      </span>
                      <span className="stat-value">{stat.base_stat}</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pokemon-info">
                  <p><strong>Abilities:</strong> {pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
                  <p><strong>Height:</strong> {pokemon.height / 10}m</p>
                  <p><strong>Weight:</strong> {pokemon.weight / 10}kg</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button id="load-more-btn" onClick={loadMorePokemons}>
        Load More
      </button>
      
     
    </div>
  );
};

export default PokemonApp;