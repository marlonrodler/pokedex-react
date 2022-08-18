import React, { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import api from "../../services/api";

import './styles.css';

export default function Pokedex() {
  const [pokemon, setPokemon] = useState();
  const [namePokemon, setNamePokemon] = useState();
  const [spinner, setSpinner] = useState();

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  const getPokemon = async (name) => {
    try {
      const response = await api.get(`pokemon/${name}`);
      console.log('response:', response);

      setPokemon(response);
      setSpinner(false);
    } catch (error) {
      setPokemon(null);
      setSpinner(false);
    }
  }

  const handleChange = event => {
    setNamePokemon(event.target.value);
  };

  const handleClick = async event => {
    event.preventDefault();
    setPokemon(null);
    setSpinner(true);
    await timeout(1500);
    if (!namePokemon) {
      getPokemon('*');
    }
    getPokemon(namePokemon.toLowerCase());
  };

  return (
    <div className='container'>
      <div className='base-pokedex'>
        <h1 className='text-center'>Pokedex</h1>
        <div className='display-pokedex'>
          <div className='info-pokedex'>
            <div className='img-pokedex'>
              {
                spinner ? (
                  <div className='spinner-container'>
                    <div className='spinner'>
                      <BeatLoader color="#ccc" />
                    </div>
                  </div>

                ) : (
                  ''
                )
              }
              {
                pokemon ? (
                  <img src={pokemon['data']['sprites']['other']['official-artwork']['front_default']} alt={pokemon.data.name} />
                ) : (
                  <div className={spinner ? 'display-none' : 'error-line'}>
                    <h2>Pokemon not found</h2>
                  </div>
                )
              }
            </div>
            <div className='name-pokemon'>
              {
                pokemon ? (
                  <p className='text-center'>{pokemon.data.id} - {pokemon.data.name}</p>
                ) : (
                  ''
                )
              }
            </div>
          </div>
        </div>
        <div className='body-pokedex'>
          <div className='form-group'>
            <label className='lb-input'></label>
            <input
              className='text-input'
              type='text'
              name="pokemon"
              id="name"
              placeholder="Enter the Pokémon's NAME or ID"
              onChange={handleChange}
              value={namePokemon}
            />
          </div>
          <div className='form-group'>
            <div className='column'>
              <div className='border-circle text-center'>
                <div className={
                  pokemon ? 'circle-success text-center' : (spinner ? 'circle-warning text-center' : 'circle-danger text-center')
                }>
                </div>
              </div>
            </div>
            <div className='column text-end'>
              <button type="button" class="btn-action" onClick={handleClick}>SEARCH</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}