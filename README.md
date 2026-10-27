# Pokédex

Busque qualquer Pokémon pelo nome ou número e veja tipos, altura, peso, habilidades, atributos base, a descrição da Pokédex e o som que ele faz nos jogos.

**Usar:** https://marlonrodler.github.io/pokedex-react/

## Como usar

- Digite o nome ou o número e aperte **Enter**. A busca sugere nomes enquanto você digita e entende "Mr. Mime", "#025" ou "Farfetch'd".
- As setas (na tela ou no teclado) vão para o anterior e o próximo; **Aleatório** sorteia um.
- O endereço guarda o Pokémon aberto (ex.: `#/pikachu`): dá para compartilhar o link e usar o botão voltar do navegador.
- A luz da Pokédex mostra o estado: amarela procurando, verde encontrado, vermelha quando não encontra.

## Dados

Tudo vem da [PokéAPI](https://pokeapi.co). Cada Pokémon é buscado uma vez por visita (cache em memória), e uma busca nova cancela a anterior. A PokéAPI ainda não tem descrições em português, então a Pokédex mostra um seletor com os idiomas disponíveis para cada Pokémon (espanhol por padrão). A escolha fica guardada no navegador.

## Tecnologias

React 18 e Vite. Testes com Vitest e Testing Library. Fonte Silkscreen (licença SIL Open Font) nos detalhes do aparelho.

## Rodar localmente

Precisa de Node.js 20.19 ou mais novo.

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes
npm run build    # gera a pasta dist
```

## Publicar

A cada push na `main`, o GitHub Actions roda os testes, gera o build e publica na branch `gh-pages` (GitHub Pages).

## Histórico

A primeira versão (2023) usava Create React App e mostrava só a imagem e o nome. Em 2026 o projeto foi modernizado:

- Buscar com o campo vazio quebrava a página; agora aparece uma orientação.
- Saiu a espera artificial de 1,5 segundo antes de cada busca, e o Enter passou a buscar.
- Os fundos vinham de sites de terceiros (Pinterest e Alphacoders); agora o visual é todo em CSS.
- Novos dados na tela: tipos, altura, peso, habilidades, atributos, descrição e som dos jogos.
- Navegação por anterior, próximo e aleatório; endereço compartilhável; sugestões de nomes.
- Cache, cancelamento de buscas, imagem reserva, acessibilidade e testes.

Pokémon é marca registrada da Nintendo, Creatures e Game Freak. Projeto de fã, sem fins comerciais.
