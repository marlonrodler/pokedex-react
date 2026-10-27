// Nomes em português para tipos e atributos, e as cores de cada tipo.
export const TYPES = {
  normal: { ink: '#1b1f24', label: 'Normal', color: '#9fa19f' },
  fire: { ink: '#ffffff', label: 'Fogo', color: '#d1201f' },
  water: { ink: '#ffffff', label: 'Água', color: '#1f6bd1' },
  grass: { ink: '#1b1f24', label: 'Planta', color: '#3fa129' },
  electric: { ink: '#1b1f24', label: 'Elétrico', color: '#e2b400' },
  ice: { ink: '#1b1f24', label: 'Gelo', color: '#3dcef3' },
  fighting: { ink: '#1b1f24', label: 'Lutador', color: '#ff8000' },
  poison: { ink: '#ffffff', label: 'Venenoso', color: '#9141cb' },
  ground: { ink: '#ffffff', label: 'Terrestre', color: '#915121' },
  flying: { ink: '#1b1f24', label: 'Voador', color: '#81b9ef' },
  psychic: { ink: '#ffffff', label: 'Psíquico', color: '#d62f69' },
  bug: { ink: '#1b1f24', label: 'Inseto', color: '#91a119' },
  rock: { ink: '#1b1f24', label: 'Pedra', color: '#afa981' },
  ghost: { ink: '#ffffff', label: 'Fantasma', color: '#704170' },
  dragon: { ink: '#ffffff', label: 'Dragão', color: '#5060e1' },
  dark: { ink: '#ffffff', label: 'Sombrio', color: '#624d4e' },
  steel: { ink: '#1b1f24', label: 'Aço', color: '#60a1b8' },
  fairy: { ink: '#1b1f24', label: 'Fada', color: '#ef70ef' },
};

export const typeInfo = (t) => TYPES[t] ?? { label: t, color: '#777', ink: '#ffffff' };

export const STATS = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque esp.',
  'special-defense': 'Defesa esp.',
  speed: 'Velocidade',
};

export const LANGS = { 'pt-BR': 'português', pt: 'português', es: 'espanhol', en: 'inglês' };

/** "lightning-rod" → "Lightning Rod" */
export const titleCase = (s = '') => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const pad = (n) => `#${String(n).padStart(4, '0')}`;
