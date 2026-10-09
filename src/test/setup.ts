// adiciona ao expect os matchers de DOM: toBeInTheDocument, toHaveTextContent, toHaveValue...
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// desmonta a tela depois de cada teste, para um não enxergar o que o outro desenhou
afterEach(() => cleanup())
