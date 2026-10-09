import { useEffect, useState, type FormEvent } from 'react';
import {
  CATEGORIAS,
  filtrarPorCategoria,
  formatarReais,
  paraCentavos,
  totalGeral,
  totalPorCategoria,
  validarGasto,
  type Categoria,
  type Gasto,
} from './lib/gastos';

const CHAVE = 'controle-de-gastos';

function carregar(): Gasto[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as Gasto[];
  } catch {
    return [];
  }
}

export default function App() {
  const [gastos, setGastos] = useState<Gasto[]>(carregar);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Alimentação');
  const [filtro, setFiltro] = useState<Categoria | 'Todas'>('Todas');
  const [erros, setErros] = useState<string[]>([]);

  // toda mudança na lista é salva no navegador: recarregar a página não perde nada
  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(gastos));
  }, [gastos]);

  function adicionar(evento: FormEvent) {
    evento.preventDefault();
    const problemas = validarGasto({ descricao, valor, categoria });
    setErros(problemas);
    if (problemas.length) return;

    setGastos((atual) => [
      { id: crypto.randomUUID(), descricao: descricao.trim(), valorCentavos: paraCentavos(valor)!, categoria },
      ...atual,
    ]);
    setDescricao('');
    setValor('');
  }

  function remover(id: string) {
    setGastos((atual) => atual.filter((gasto) => gasto.id !== id));
  }

  const visiveis = filtrarPorCategoria(gastos, filtro);
  const porCategoria = totalPorCategoria(gastos);

  return (
    <main>
      <header>
        <h1>Controle de Gastos</h1>
        <p className="total" aria-label="Total gasto">
          {formatarReais(totalGeral(gastos))}
        </p>
      </header>

      <form onSubmit={adicionar} noValidate>
        <div className="campo">
          <label htmlFor="descricao">Descrição</label>
          <input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Mercado" />
        </div>
        <div className="campo">
          <label htmlFor="valor">Valor (R$)</label>
          <input id="valor" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" />
        </div>
        <div className="campo">
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit">Adicionar</button>
      </form>

      {erros.length > 0 && (
        <ul role="alert" className="erros">
          {erros.map((erro) => (
            <li key={erro}>{erro}</li>
          ))}
        </ul>
      )}

      {porCategoria.length > 0 && (
        <section aria-label="Resumo por categoria" className="resumo">
          {porCategoria.map(({ categoria, total }) => (
            <div key={categoria}>
              <span>{categoria}</span>
              <strong>{formatarReais(total)}</strong>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Gastos">
        <div className="campo filtro">
          <label htmlFor="filtro">Mostrar</label>
          <select id="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value as Categoria | 'Todas')}>
            <option>Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {visiveis.length === 0 ? (
          <p className="vazio">Nenhum gasto por aqui ainda.</p>
        ) : (
          <ul className="lista">
            {visiveis.map((gasto) => (
              <li key={gasto.id}>
                <div>
                  <span className="descricao">{gasto.descricao}</span>
                  <span className="categoria">{gasto.categoria}</span>
                </div>
                <strong>{formatarReais(gasto.valorCentavos)}</strong>
                <button type="button" onClick={() => remover(gasto.id)} aria-label={`Remover ${gasto.descricao}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
