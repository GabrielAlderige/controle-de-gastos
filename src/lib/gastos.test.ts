import { describe, expect, it } from 'vitest';
import {
  filtrarPorCategoria,
  formatarReais,
  paraCentavos,
  totalGeral,
  totalPorCategoria,
  validarGasto,
  type Gasto,
} from './gastos';

const gastos: Gasto[] = [
  { id: '1', descricao: 'Mercado', valorCentavos: 15_000, categoria: 'Alimentação' },
  { id: '2', descricao: 'Ônibus', valorCentavos: 450, categoria: 'Transporte' },
  { id: '3', descricao: 'Padaria', valorCentavos: 1_250, categoria: 'Alimentação' },
];

describe('formatarReais', () => {
  it('formata centavos como moeda brasileira', () => {
    expect(formatarReais(1250)).toBe('R$ 12,50');
    expect(formatarReais(123456)).toBe('R$ 1.234,56');
    expect(formatarReais(0)).toBe('R$ 0,00');
  });
});

describe('paraCentavos', () => {
  it.each([
    ['12,50', 1250],
    ['12,5', 1250],
    ['8', 800],
    ['1.234,56', 123456],
    ['R$ 3,99', 399],
    ['  7,00  ', 700],
  ])('"%s" vira %i centavos', (texto, esperado) => {
    expect(paraCentavos(texto)).toBe(esperado);
  });

  it.each(['', 'abc', '12,345', '1,2,3', '-5', '12.5'])('"%s" não é valor', (texto) => {
    expect(paraCentavos(texto)).toBeNull();
  });

  it('não sofre com o erro de ponto flutuante', () => {
    // 0.1 + 0.2 !== 0.3 em JavaScript; em centavos inteiros a conta fecha
    expect(paraCentavos('0,10')! + paraCentavos('0,20')!).toBe(30);
  });
});

describe('validarGasto', () => {
  it('aceita um gasto completo', () => {
    expect(validarGasto({ descricao: 'Almoço', valor: '25,90', categoria: 'Alimentação' })).toEqual([]);
  });

  it('acusa cada campo errado', () => {
    expect(validarGasto({ descricao: ' ', valor: 'xyz', categoria: 'Lazer' })).toEqual([
      'Descreva o gasto (mínimo 2 letras).',
      'Valor inválido. Use o formato 12,50.',
    ]);
  });

  it('recusa valor zero', () => {
    expect(validarGasto({ descricao: 'Nada', valor: '0,00', categoria: 'Outros' })).toEqual([
      'O valor precisa ser maior que zero.',
    ]);
  });
});

describe('totais', () => {
  it('soma tudo', () => {
    expect(totalGeral(gastos)).toBe(16_700);
    expect(totalGeral([])).toBe(0);
  });

  it('agrupa por categoria, do maior para o menor', () => {
    expect(totalPorCategoria(gastos)).toEqual([
      { categoria: 'Alimentação', total: 16_250 },
      { categoria: 'Transporte', total: 450 },
    ]);
  });
});

describe('filtrarPorCategoria', () => {
  it('"Todas" devolve a lista inteira', () => {
    expect(filtrarPorCategoria(gastos, 'Todas')).toHaveLength(3);
  });

  it('filtra pela categoria escolhida', () => {
    expect(filtrarPorCategoria(gastos, 'Alimentação').map((g) => g.descricao)).toEqual(['Mercado', 'Padaria']);
    expect(filtrarPorCategoria(gastos, 'Lazer')).toEqual([]);
  });
});
