import { useCallback, useEffect, useRef, useState } from 'react';
import { NotFoundError, getPokemon, getSpeciesNames, toQuery } from './api/pokeapi';
import { LANGS, STATS, pad, titleCase, typeInfo } from './labels';

const FIRST = '1';
const readHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));

export default function App() {
  const [view, setView] = useState({ status: 'loading', pokemon: null, query: '' });
  const [text, setText] = useState('');
  const [species, setSpecies] = useState({ count: 1025, names: [] });
  const [imgFailed, setImgFailed] = useState(false);
  const ctrlRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const load = useCallback(async (raw) => {
    const query = toQuery(raw);
    if (!query) {
      setView((v) => ({ ...v, status: 'empty' }));
      return;
    }
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setView((v) => ({ ...v, status: 'loading', query: raw }));
    try {
      const pokemon = await getPokemon(query, ctrl.signal);
      setImgFailed(false);
      setView({ status: 'found', pokemon, query: raw });
      document.title = `${titleCase(pokemon.name)} ${pad(pokemon.id)} · Pokédex`;
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setView((v) => ({ status: err instanceof NotFoundError ? 'notfound' : 'error', pokemon: v.pokemon, query: raw }));
    }
  }, []);

  // O endereço guarda o Pokémon aberto (#/25): dá para compartilhar e usar o botão voltar
  useEffect(() => {
    const onHash = () => load(readHash() || FIRST);
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [load]);

  useEffect(() => {
    const ctrl = new AbortController();
    getSpeciesNames(ctrl.signal).then(setSpecies).catch(() => {}); // sugestões são opcionais
    return () => ctrl.abort();
  }, []);

  const go = (q) => {
    const key = toQuery(q);
    if (!key) {
      setView((v) => ({ ...v, status: 'empty' }));
      inputRef.current?.focus();
      return;
    }
    if (readHash() === key) load(key);
    else window.location.hash = `/${key}`;
  };

  const submit = (e) => {
    e.preventDefault();
    go(text);
  };

  const p = view.pokemon;
  const current = p?.speciesId ?? 1;
  const step = (delta) => {
    const next = ((current - 1 + delta + species.count) % species.count) + 1;
    setText('');
    go(String(next));
  };
  const random = () => {
    setText('');
    go(String(1 + Math.floor(Math.random() * species.count)));
  };
  const playCry = () => {
    if (!p?.cry) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(p.cry);
    audioRef.current.volume = 0.4;
    audioRef.current.play().catch(() => {});
  };

  // Setas do teclado navegam quando o foco não está no campo de busca
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const led = { loading: 'is-busy', found: 'is-ok', notfound: 'is-bad', error: 'is-bad', empty: 'is-bad' }[view.status];
  const message = {
    loading: 'Procurando…',
    notfound: `Nenhum Pokémon chamado "${view.query}". Confira o nome ou use o número.`,
    error: 'A PokéAPI não respondeu. Confira a sua conexão e tente de novo.',
    empty: 'Digite um nome ou número para buscar.',
  }[view.status];
  const mainType = p ? typeInfo(p.types[0]).color : '#5a6b7a';

  return (
    <div className="page" style={{ '--type': mainType }}>
      <main className="dex" aria-labelledby="dex-title">
        {/* Metade esquerda: tela e busca */}
        <section className="dex__left">
          <header className="dex__top">
            <span className={`lens ${led ?? ''}`} aria-hidden="true" />
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            <h1 id="dex-title" className="dex__title">Pokédex</h1>
          </header>

          <div className="screen-frame">
            <div className={`screen is-${view.status}`} aria-busy={view.status === 'loading'}>
              {p && view.status !== 'notfound' && view.status !== 'error' && view.status !== 'empty' && (
                <>
                  {p.image && !imgFailed ? (
                    <img
                      key={p.id}
                      className="screen__art"
                      src={p.image}
                      alt={`Arte oficial de ${titleCase(p.name)}`}
                      width="475"
                      height="475"
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <div className="screen__missing">Imagem indisponível</div>
                  )}
                  <p className="screen__id">{pad(p.id)}</p>
                </>
              )}
              {view.status !== 'found' && <p className="screen__msg" role="status">{message}</p>}
            </div>
            <div className="screen-frame__foot" aria-hidden="true">
              <span className="speaker"><i /><i /><i /><i /></span>
            </div>
          </div>

          <form className="search" onSubmit={submit} role="search">
            <label htmlFor="q" className="sr-only">Nome ou número do Pokémon</label>
            <input
              id="q"
              ref={inputRef}
              className="search__input"
              list="pokemon-names"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nome ou número"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
            />
            <datalist id="pokemon-names">
              {species.names.map((n) => <option key={n} value={n} />)}
            </datalist>
            <button className="btn btn--search" type="submit">Buscar</button>
          </form>

          <div className="pad" role="group" aria-label="Navegar pela Pokédex">
            <button type="button" className="pad__btn" onClick={() => step(-1)} aria-label="Pokémon anterior" disabled={!p}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="btn btn--random" onClick={random}>Aleatório</button>
            <button type="button" className="pad__btn" onClick={() => step(1)} aria-label="Próximo Pokémon" disabled={!p}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        <span className="hinge" aria-hidden="true" />

        {/* Metade direita: informações */}
        <section className="dex__right" aria-live="polite" aria-busy={view.status === 'loading'}>
          {p ? (
            <article className={`info${view.status !== 'found' ? ' is-stale' : ''}`}>
              <header className="info__head">
                <h2 className="info__name">{titleCase(p.name)}</h2>
                {p.genus && <p className="info__genus">{p.genus}</p>}
                <ul className="types" aria-label="Tipos">
                  {p.types.map((t) => (
                    <li key={t} style={{ '--c': typeInfo(t).color, '--ci': typeInfo(t).ink }}>{typeInfo(t).label}</li>
                  ))}
                </ul>
              </header>

              {p.flavor && (
                <p className="info__flavor" lang={p.flavor.lang}>
                  {p.flavor.text}
                  {p.flavor.lang !== 'pt-BR' && <span className="info__lang"> (descrição em {LANGS[p.flavor.lang]})</span>}
                </p>
              )}

              <dl className="facts">
                <div><dt>Altura</dt><dd>{p.height.toLocaleString('pt-BR')} m</dd></div>
                <div><dt>Peso</dt><dd>{p.weight.toLocaleString('pt-BR')} kg</dd></div>
                <div>
                  <dt>Habilidades</dt>
                  <dd>
                    {p.abilities.map((a, i) => (
                      <span key={a.name}>
                        {i > 0 && ', '}
                        {titleCase(a.name)}
                        {a.hidden && <small> (oculta)</small>}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <h3 className="info__sub">Atributos base</h3>
              <dl className="stats">
                {p.stats.map((s) => (
                  <div key={s.name} className="stat">
                    <dt>{STATS[s.name] ?? s.name}</dt>
                    <dd>
                      <span className="stat__value">{s.value}</span>
                      <span className="stat__bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (s.value / 200) * 100)}%` }} /></span>
                    </dd>
                  </div>
                ))}
                <div className="stat stat--total">
                  <dt>Total</dt>
                  <dd><span className="stat__value">{p.stats.reduce((a, s) => a + s.value, 0)}</span></dd>
                </div>
              </dl>

              {p.cry && (
                <button type="button" className="btn btn--cry" onClick={playCry}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></svg>
                  Ouvir o som dos jogos
                </button>
              )}
            </article>
          ) : (
            <p className="info__empty">{view.status === 'loading' ? 'Carregando…' : 'Busque um Pokémon para ver os detalhes.'}</p>
          )}
        </section>
      </main>

      <footer className="foot">
        Dados da <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a>. Pokémon é marca da Nintendo, Creatures e Game Freak; projeto de fã, sem fins comerciais.
        Feito por <a href="https://marlonrodler.github.io" target="_blank" rel="noopener noreferrer">Marlon Rodler</a>.
      </footer>
    </div>
  );
}
