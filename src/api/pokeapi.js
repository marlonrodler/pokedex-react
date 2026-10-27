// Acesso à PokéAPI com cache em memória: cada Pokémon é buscado uma vez só por visita.
const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map();

export class NotFoundError extends Error {}

async function getJson(path, signal) {
  if (cache.has(path)) return cache.get(path);
  const promise = fetch(`${BASE}/${path}`, { signal }).then(async (res) => {
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
  cache.set(path, promise);
  try {
    return await promise;
  } catch (err) {
    cache.delete(path); // não guarda falha nem cancelamento
    throw err;
  }
}

/** Transforma o que o usuário digitou na chave da API: "Mr. Mime" → "mr-mime", "#025" → "25". */
export function toQuery(text = '') {
  const t = String(text).trim().toLowerCase();
  if (/^#?\d+$/.test(t)) return String(Number(t.replace('#', '')));
  return t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[.'’:]/g, '')
    .replace(/\s+/g, '-');
}

const pickFlavor = (entries) => {
  const order = ['pt-BR', 'pt', 'es', 'en'];
  for (const lang of order) {
    const found = [...entries].reverse().find((e) => e.language.name === lang);
    if (found) return { text: found.flavor_text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim(), lang };
  }
  return null;
};

/** Busca um Pokémon pelo nome ou número e devolve só o que a tela usa. */
export async function getPokemon(query, signal) {
  const p = await getJson(`pokemon/${query}`, signal);
  let species = null;
  try {
    species = await getJson(p.species.url.replace(`${BASE}/`, '').replace(/\/$/, ''), signal);
  } catch (err) {
    if (signal?.aborted) throw err; // a descrição é opcional: segue sem ela
  }
  const art = p.sprites?.other?.['official-artwork']?.front_default;
  return {
    id: p.id,
    speciesId: species?.id ?? p.id,
    name: p.name,
    displayName: species?.names?.find((n) => n.language.name === 'en')?.name ?? p.name,
    image: art || p.sprites?.front_default || null,
    pixel: p.sprites?.front_default || null,
    types: p.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    height: p.height / 10, // metros
    weight: p.weight / 10, // quilos
    abilities: p.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    stats: p.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    genus: species?.genera?.find((g) => g.language.name === 'en')?.genus ?? null,
    flavor: species ? pickFlavor(species.flavor_text_entries) : null,
    cry: p.cries?.latest || p.cries?.legacy || null,
  };
}

/** Lista de nomes para as sugestões da busca (uma requisição, guardada em cache). */
export async function getSpeciesNames(signal) {
  const data = await getJson('pokemon-species?limit=2000', signal);
  return { count: data.count, names: data.results.map((r) => r.name) };
}

export function clearCache() {
  cache.clear();
}
