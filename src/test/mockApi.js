// PokéAPI de mentira para os testes (formato real, dados resumidos).
const art = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const mon = (id, name, types, stats = [45, 49, 49, 65, 65, 45]) => ({
  id,
  name,
  height: 7,
  weight: 69,
  types: types.map((t, i) => ({ slot: i + 1, type: { name: t } })),
  stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((n, i) => ({ base_stat: stats[i], stat: { name: n } })),
  abilities: [{ is_hidden: false, ability: { name: 'overgrow' } }, { is_hidden: true, ability: { name: 'chlorophyll' } }],
  sprites: { front_default: null, other: { 'official-artwork': { front_default: art(id) } } },
  species: { url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
  cries: { latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg` },
});

const species = (id, name) => ({
  id,
  names: [{ name, language: { name: 'en' } }],
  genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
  flavor_text_entries: [
    { flavor_text: 'Old english text.', language: { name: 'en' } },
    { flavor_text: 'A strange seed was\nplanted on its\fback at birth.', language: { name: 'en' } },
    { flavor_text: 'Una semilla rara\nfue plantada en su lomo.', language: { name: 'es' } },
    { flavor_text: 'Une étrange graine.', language: { name: 'fr' } },
  ],
});

export const MONS = {
  1: [mon(1, 'bulbasaur', ['grass', 'poison']), species(1, 'Bulbasaur')],
  2: [mon(2, 'ivysaur', ['grass', 'poison']), species(2, 'Ivysaur')],
  25: [mon(25, 'pikachu', ['electric'], [35, 55, 40, 50, 50, 90]), species(25, 'Pikachu')],
  1025: [mon(1025, 'pecharunt', ['poison', 'ghost']), species(1025, 'Pecharunt')],
};
const byName = Object.fromEntries(Object.values(MONS).map(([m]) => [m.name, m.id]));

export function makeFetch() {
  return async (url) => {
    const path = url.replace('https://pokeapi.co/api/v2/', '');
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (path.startsWith('pokemon-species?')) {
      return ok({ count: 1025, results: Object.values(MONS).map(([m]) => ({ name: m.name })) });
    }
    let m = path.match(/^pokemon-species\/(\d+)$/);
    if (m && MONS[m[1]]) return ok(MONS[m[1]][1]);
    m = path.match(/^pokemon\/(.+)$/);
    if (m) {
      const id = MONS[m[1]] ? m[1] : byName[m[1]];
      if (id) return ok(MONS[id][0]);
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
}
