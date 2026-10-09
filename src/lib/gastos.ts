/**
 * Regras do controle de gastos. Tudo aqui é função pura: recebe dados e
 * devolve dados, sem tela e sem navegador. Por isso é o lugar ideal para o
 * teste unitário — roda em milissegundos e não depende de nada.
 *
 * Dinheiro é guardado em CENTAVOS (número inteiro). Somar 0.1 + 0.2 em
 * ponto flutuante dá 0.30000000000000004; somar 10 + 20 centavos dá 30.
 */

export const CATEGORIAS = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Outros'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export interface Gasto {
  id: string;
  descricao: string;
  valorCentavos: number;
  categoria: Categoria;
}

export interface NovoGasto {
  descricao: string;
  valor: string; // como a pessoa digitou: "12,50", "1.234,56", "8"
  categoria: Categoria;
}

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 1250 → "R$ 12,50" (com espaço comum, não o inquebrável do Intl). */
export function formatarReais(centavos: number): string {
  return reais.format(centavos / 100).replace(/\s/g, ' ');
}

/**
 * Converte o texto digitado em centavos. Aceita o formato brasileiro, com
 * ponto de milhar e vírgula decimal. Devolve null quando não é um valor.
 *   "12,50" → 1250    "1.234,5" → 123450    "abc" → null
 */
export function paraCentavos(texto: string): number | null {
  const limpo = texto.trim().replace(/^R\$\s*/, '');
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return null;
  const [inteiro, decimal = ''] = limpo.replace(/\./g, '').split(',');
  return Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
}

/** Lista de erros do formulário; vazia quando está tudo certo. */
export function validarGasto(novo: NovoGasto): string[] {
  const erros: string[] = [];
  if (novo.descricao.trim().length < 2) erros.push('Descreva o gasto (mínimo 2 letras).');
  const centavos = paraCentavos(novo.valor);
  if (centavos === null) erros.push('Valor inválido. Use o formato 12,50.');
  else if (centavos === 0) erros.push('O valor precisa ser maior que zero.');
  if (!CATEGORIAS.includes(novo.categoria)) erros.push('Escolha uma categoria.');
  return erros;
}

export function totalGeral(gastos: Gasto[]): number {
  return gastos.reduce((soma, gasto) => soma + gasto.valorCentavos, 0);
}

/** Total de cada categoria que tem pelo menos um gasto, do maior para o menor. */
export function totalPorCategoria(gastos: Gasto[]): { categoria: Categoria; total: number }[] {
  const mapa = new Map<Categoria, number>();
  for (const gasto of gastos) {
    mapa.set(gasto.categoria, (mapa.get(gasto.categoria) ?? 0) + gasto.valorCentavos);
  }
  return [...mapa]
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

export function filtrarPorCategoria(gastos: Gasto[], categoria: Categoria | 'Todas'): Gasto[] {
  return categoria === 'Todas' ? gastos : gastos.filter((gasto) => gasto.categoria === categoria);
}
