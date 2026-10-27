import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { clearCache, getPokemon, toQuery } from './api/pokeapi';
import { makeFetch } from './test/mockApi';

beforeEach(() => {
  clearCache();
  window.location.hash = '';
  vi.stubGlobal('fetch', vi.fn(makeFetch()));
});
afterEach(() => vi.unstubAllGlobals());

describe('busca', () => {
  it('entende nome e número do jeito que a pessoa digita', () => {
    expect(toQuery('  Pikachu ')).toBe('pikachu');
    expect(toQuery('#025')).toBe('25');
    expect(toQuery('Mr. Mime')).toBe('mr-mime');
    expect(toQuery("Farfetch'd")).toBe('farfetchd');
    expect(toQuery('Nidoran♀')).toBe('nidoran-f');
    expect(toQuery('')).toBe('');
  });

  it('guarda em cache: o mesmo Pokémon não é buscado duas vezes', async () => {
    await getPokemon('25');
    await getPokemon('25');
    expect(fetch).toHaveBeenCalledTimes(2); // pokemon + species, uma vez cada
  });

  it('monta os dados da tela', async () => {
    const p = await getPokemon('1');
    expect(p.types).toEqual(['grass', 'poison']);
    expect(p.height).toBe(0.7);
    expect(p.weight).toBe(6.9);
    expect(p.flavors).toEqual({
      en: 'A strange seed was planted on its back at birth.', // a mais recente de cada idioma
      es: 'Una semilla rara fue plantada en su lomo.',
      fr: 'Une étrange graine.',
    });
  });
});

describe('tela', () => {
  it('mostra a descrição em espanhol e deixa trocar o idioma, lembrando a escolha', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(<App />);
    expect(await screen.findByText('Una semilla rara fue plantada en su lomo.')).toBeInTheDocument();
    const select = screen.getByLabelText(/descrição em/i);
    expect([...select.options].map((o) => o.textContent)).toEqual(['Español', 'English', 'Français']);
    await user.selectOptions(select, 'fr');
    expect(screen.getByText('Une étrange graine.')).toBeInTheDocument();
    expect(localStorage.getItem('pokedex:lang')).toBe('fr');
  });

  it('abre no número 1 e busca com Enter', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Bulbasaur' })).toBeInTheDocument();
    expect(screen.getByText('Planta')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/nome ou número/i), 'Pikachu{Enter}');
    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/pikachu');
    expect(screen.getByText('Elétrico')).toBeInTheDocument();
  });

  it('avisa quando não encontra e quando a busca está vazia (antes quebrava)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Bulbasaur' });

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByText(/digite um nome ou número/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/nome ou número/i), 'Digimon{Enter}');
    expect(await screen.findByText(/nenhum pokémon chamado "digimon"/i)).toBeInTheDocument();
  });

  it('as setas vão para o anterior e o próximo, dando a volta', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Bulbasaur' });
    await user.click(screen.getByRole('button', { name: /próximo pokémon/i }));
    expect(await screen.findByRole('heading', { name: 'Ivysaur' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pokémon anterior/i }));
    await user.click(await screen.findByRole('button', { name: /pokémon anterior/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Pecharunt' })).toBeInTheDocument());
  });
});
