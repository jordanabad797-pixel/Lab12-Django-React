import './ErrorMessage.css';

/** Error state of a request: what failed, why, and a retry action. */
function ErrorMessage({ error, onRetry }) {
  const origin = error.status ? `HTTP ${error.status}` : 'sin respuesta del servidor';
  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">
        !
      </div>
      <div className="error-message__body">
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        <p className="error-message__meta">
          Tipo: <code>{error.kind}</code> · {origin}
        </p>
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
