const Receive = () => {
  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Receive</h1>
          <p className="muted">Administra direcciones y solicitudes entrantes (coming soon).</p>
        </div>
      </div>

      <div className="card">
        <p>
          Esta sección se utilizará para gestionar direcciones de recepción, generar códigos QR y
          compartir información de forma segura. Por ahora, solo es una vista preliminar.
        </p>
        <p className="muted">
          Conecta tu keyring o agrega cuentas locales para continuar en futuras versiones.
        </p>
      </div>
    </section>
  );
};

export default Receive;
