# Controle de Gastos

[![CI/CD](https://github.com/GabrielAlderige/controle-de-gastos/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrielAlderige/controle-de-gastos/actions/workflows/ci.yml)

Aplicação React + TypeScript para lançar gastos, ver o total por categoria e filtrar a lista. Os dados ficam no navegador (localStorage).

**No ar:** https://gabrielalderige.github.io/controle-de-gastos/

O objetivo do projeto é demonstrar um **pipeline de CI/CD com GitHub Actions** e três camadas de teste.

## O pipeline

```
push / pull request
        │
        ▼
   ┌──────────┐
   │qualidade │  ESLint + checagem de tipos (tsc)
   └────┬─────┘
        ├──────────────┐
        ▼              ▼
  ┌──────────┐   ┌───────────┐
  │unitarios │   │ interface │  Playwright no Chromium (computador e celular)
  │ (Vitest) │   └─────┬─────┘
  └────┬─────┘         │
       └───────┬───────┘
               ▼
         ┌──────────┐
         │  deploy  │  só em push na main, e só se tudo acima passou
         └──────────┘  → GitHub Pages
```

Arquivo: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- **CI**: todo push e todo pull request roda lint, tipos e os testes numa máquina limpa (Ubuntu).
- **CD**: se tudo passar na `main`, o site é construído e publicado no GitHub Pages sem intervenção manual.
- Quando um teste de interface falha, o relatório do Playwright (print, rastro e passo a passo) fica disponível para download na rodada.

## Os testes

| Camada | Ferramenta | Arquivo | O que prova |
|---|---|---|---|
| Unitário | Vitest | `src/lib/gastos.test.ts` | Regras puras: conversão de "1.234,56" em centavos, validação, totais, filtro |
| Componente | Vitest + Testing Library (jsdom) | `src/App.test.tsx` | A tela reage certo: adiciona, valida, remove, guarda no navegador |
| Interface (E2E) | Playwright | `e2e/gastos.spec.ts` | O site **construído** funciona num Chromium de verdade, no computador e no celular |

A cobertura mínima (90% de linhas) é exigida no `vite.config.ts`: se cair, a CI falha.

## Rodando localmente

```bash
npm install
npm run dev            # site em http://localhost:5173
npm test               # testes unitários e de componente
npm run test:coverage  # idem, com relatório de cobertura em coverage/
npx playwright install chromium
npm run e2e            # testes de interface
npm run lint
npm run typecheck
```

## Decisões

- **Dinheiro em centavos (inteiro).** `0.1 + 0.2` dá `0.30000000000000004` em JavaScript; somando centavos inteiros a conta sempre fecha.
- **Regras separadas da tela** (`src/lib/gastos.ts`): funções puras são baratas de testar e não dependem de React.
- **Testes encontram os elementos pelo rótulo**, como uma pessoa (ou um leitor de tela) faria, e não por classe CSS. Assim, mudar o visual não quebra o teste, mas quebrar a acessibilidade quebra.
