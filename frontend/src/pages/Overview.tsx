import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetNodeStatus, GetPeers } from '../../wailsjs/go/main/App';
import type { NodeStatus, Peer } from '../types/node';

const numberFormatter = new Intl.NumberFormat('en-US');

const Overview = () => {
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, peersData] = await Promise.all([GetNodeStatus(), GetPeers()]);
      setStatus(statusData);
      setPeers(peersData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo obtener la información del nodo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncState = useMemo(() => {
    if (!status) {
      return 'Sin datos';
    }
    return status.catchingUp ? 'Sincronizando…' : 'Sincronizado';
  }, [status]);

  const peerCount = peers.length;

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Overview</h1>
          <p className="muted">Estado general del nodo PLT en tu equipo.</p>
        </div>
        <button
          className="ghost-button"
          onClick={loadData}
          disabled={loading}
          type="button"
          aria-label="Recargar estado del nodo"
        >
          {loading ? 'Actualizando…' : 'Reload'}
        </button>
      </div>

      {loading && (
        <div className="state-card">
          <p>Cargando información del nodo…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-card error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && status && (
        <>
          <div className="cards-grid">
            <div className="card">
              <p className="label">Nodo</p>
              <h2>{status.moniker || '—'}</h2>
              <p className="muted">Chain ID: {status.network || '—'}</p>
              <p className="muted">Versión: {status.version || '—'}</p>
            </div>

            <div className="card">
              <p className="label">Altura de bloque</p>
              <h2>{numberFormatter.format(status.latestBlockHeight)}</h2>
              <p className="muted">
                Bloque inicial: {numberFormatter.format(status.earliestBlockHeight)}
              </p>
            </div>

            <div className="card">
              <p className="label">Estado & Peers</p>
              <h2>{syncState}</h2>
              <p className="muted">Peers activos: {peerCount}</p>
            </div>
          </div>

          <div className="card table-card">
            <div className="card-header">
              <div>
                <p className="label">Peers conectados</p>
                <h3>{peerCount} vecinos</h3>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Moniker</th>
                    <th>ID</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {peerCount === 0 && (
                    <tr>
                      <td colSpan={3} className="muted center">
                        No hay peers conectados en este momento.
                      </td>
                    </tr>
                  )}
                  {peers.map((peer) => (
                    <tr key={peer.id}>
                      <td>{peer.moniker || '—'}</td>
                      <td className="code">{peer.id}</td>
                      <td className="code">{peer.remoteIp || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Overview;
