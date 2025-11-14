import { FormEvent, useState, ChangeEvent } from 'react';

type SendFormState = {
  from: string;
  to: string;
  amount: string;
};

const defaultState: SendFormState = {
  from: '',
  to: '',
  amount: '',
};

const Send = () => {
  const [form, setForm] = useState<SendFormState>(defaultState);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (field: keyof SendFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.from.trim() || !form.to.trim() || !form.amount.trim()) {
      setMessage('Completa todos los campos antes de continuar.');
      return;
    }

    setMessage('Funcionalidad no implementada aún. Aquí se firmarán y enviarán transacciones.');
  };

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Send</h1>
          <p className="muted">Prepara el envío de PLT (stub/UI).</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <label>
          <span>From</span>
          <input
            type="text"
            value={form.from}
            onChange={handleChange('from')}
            placeholder="plt1..."
          />
        </label>

        <label>
          <span>To</span>
          <input
            type="text"
            value={form.to}
            onChange={handleChange('to')}
            placeholder="plt1..."
          />
        </label>

        <label>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.000001"
            value={form.amount}
            onChange={handleChange('amount')}
            placeholder="0.0"
          />
        </label>

        <button type="submit" className="primary-button">
          Enviar
        </button>

        {message && <p className="muted warning">{message}</p>}
      </form>
    </section>
  );
};

export default Send;
