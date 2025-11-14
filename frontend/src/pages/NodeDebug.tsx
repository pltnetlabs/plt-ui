import { useCallback, useEffect, useState } from 'react';
import { GetNodeInfoRaw } from '../../wailsjs/go/main/App';

const NodeDebug = () => {
  const [payload, setPayload] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await GetNodeInfoRaw();
      setPayload(raw);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo obtener el JSON del nodo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Node / Debug</h1>
          <p className="muted">Inspecciona el payload crudo de /status.</p>
        </div>
        <button
          className="ghost-button"
          onClick={loadInfo}
          disabled={loading}
          type="button"
        >
          {loading ? 'Cargando…' : 'Reload'}
        </button>
      </div>

      {loading && (
        <div className="state-card">
          <p>Consultando /status…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-card error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="card">
          <pre className="debug-output">{payload}</pre>
        </div>
      )}
    </section>
  );
};

export default NodeDebug;
