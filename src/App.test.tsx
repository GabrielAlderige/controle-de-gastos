import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

/**
 * Teste de COMPONENTE: monta a tela num navegador simulado (jsdom) e usa como
 * um usuário usaria — achando os campos pelo rótulo, não por classe CSS.
 */
describe('App', () => {
  beforeEach(() => localStorage.clear());

  async function adicionar(descricao: string, valor: string, categoria?: string) {
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Descrição'), descricao);
    await usuario.type(screen.getByLabelText('Valor (R$)'), valor);
    if (categoria) await usuario.selectOptions(screen.getByLabelText('Categoria'), categoria);
    await usuario.click(screen.getByRole('button', { name: 'Adicionar' }));
  }

  it('começa vazio', () => {
    render(<App />);
    expect(screen.getByText('Nenhum gasto por aqui ainda.')).toBeInTheDocument();
    expect(screen.getByLabelText('Total gasto')).toHaveTextContent('R$ 0,00');
  });

  it('adiciona um gasto e atualiza o total', async () => {
    render(<App />);
    await adicionar('Mercado', '150,00');

    const lista = screen.getByRole('list');
    expect(within(lista).getByText('Mercado')).toBeInTheDocument();
    expect(screen.getByLabelText('Total gasto')).toHaveTextContent('R$ 150,00');
    // o formulário limpa para o próximo lançamento
    expect(screen.getByLabelText('Descrição')).toHaveValue('');
  });

  it('mostra os erros e não adiciona nada quando o formulário está errado', async () => {
    render(<App />);
    await adicionar('X', 'abc');

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Descreva o gasto');
    expect(alerta).toHaveTextContent('Valor inválido');
    expect(screen.getByText('Nenhum gasto por aqui ainda.')).toBeInTheDocument();
  });

  it('remove um gasto', async () => {
    render(<App />);
    await adicionar('Cinema', '40');
    await userEvent.click(screen.getByRole('button', { name: 'Remover Cinema' }));
    expect(screen.queryByText('Cinema')).not.toBeInTheDocument();
  });

  it('guarda os gastos no navegador', async () => {
    const { unmount } = render(<App />);
    await adicionar('Aluguel', '1.200,00', 'Moradia');
    unmount();

    render(<App />); // "recarregou a página"
    expect(screen.getByText('Aluguel')).toBeInTheDocument();
  });
});
