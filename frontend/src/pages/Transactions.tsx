import { useCallback, useEffect, useState } from 'react';
import { GetUnconfirmedTxs } from '../../wailsjs/go/main/App';
import type { UnconfirmedTxs } from '../types/node';

const DEFAULT_LIMIT = 50;

const Transactions = () => {
  const [txs, setTxs] = useState<UnconfirmedTxs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTxs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetUnconfirmedTxs(DEFAULT_LIMIT);
      setTxs(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo obtener el mempool del nodo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTxs();
  }, [loadTxs]);

  const totalTxs = txs?.total ?? 0;

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Transactions</h1>
          <p className="muted">Transacciones pendientes en el mempool (límite {DEFAULT_LIMIT}).</p>
        </div>
        <button
          className="ghost-button"
          onClick={loadTxs}
          disabled={loading}
          type="button"
        >
          {loading ? 'Consultando…' : 'Reload'}
        </button>
      </div>

      {loading && (
        <div className="state-card">
          <p>Consultando transacciones pendientes…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-card error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="card table-card">
          <div className="card-header">
            <div>
              <p className="label">Transacciones en mempool</p>
              <h3>{totalTxs} txs</h3>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hash / Data</th>
                </tr>
              </thead>
              <tbody>
                {totalTxs === 0 && (
                  <tr>
                    <td className="muted center">No hay transacciones pendientes.</td>
                  </tr>
                )}
                {txs?.txs?.map((tx, index) => (
                  <tr key={`${tx}-${index}`}>
                    <td className="code">{tx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default Transactions;
