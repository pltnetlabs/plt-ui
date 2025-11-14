import { FormEvent, useCallback, useEffect, useState } from 'react';
import { GetRPCBaseURL, SetRPCBaseURL } from '../../wailsjs/go/main/App';

const DEFAULT_RPC_URL = 'http://localhost:26657';

const Settings = () => {
  const [rpcURL, setRpcURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentURL = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const current = await GetRPCBaseURL();
      setRpcURL(current);
    } catch (err) {
      const description =
        err instanceof Error ? err.message : 'No se pudo obtener la configuración actual.';
      setError(description);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentURL();
  }, [loadCurrentURL]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await SetRPCBaseURL(rpcURL);
      const sanitized = await GetRPCBaseURL();
      setRpcURL(sanitized);
      setMessage('RPC actualizado. Las próximas consultas utilizarán esta URL.');
    } catch (err) {
      const description = err instanceof Error ? err.message : 'No se pudo guardar la URL.';
      setError(description);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await SetRPCBaseURL('');
      await loadCurrentURL();
      setMessage(`Se restableció la URL por defecto (${DEFAULT_RPC_URL}).`);
    } catch (err) {
      const description =
        err instanceof Error ? err.message : 'No se pudo restablecer la URL por defecto.';
      setError(description);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">
            Ajusta la URL base del RPC sin reiniciar la aplicación. Ideal para apuntar a nodos
            remotos o entornos de prueba.
          </p>
        </div>
        <button
          className="ghost-button"
          onClick={loadCurrentURL}
          disabled={loading || saving}
          type="button"
        >
          {loading ? 'Cargando…' : 'Recargar'}
        </button>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <label>
          <span>RPC URL</span>
          <input
            type="text"
            value={rpcURL}
            onChange={(event) => setRpcURL(event.target.value)}
            placeholder="http://localhost:26657"
            disabled={loading || saving}
          />
        </label>

        <p className="muted">
          Si dejas el campo vacío, se usará la URL por defecto ({DEFAULT_RPC_URL}).
        </p>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={loading || saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={handleReset}
            disabled={loading || saving}
          >
            Restablecer
          </button>
        </div>

        {error && (
          <p className="muted warning" role="alert">
            {error}
          </p>
        )}

        {message && !error && <p className="muted">{message}</p>}
      </form>
    </section>
  );
};

export default Settings;
