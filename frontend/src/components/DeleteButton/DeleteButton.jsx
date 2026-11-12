import { useState } from 'react';

/**
 * Two-step delete: the first click asks for confirmation inline (no blocking
 * window.confirm), the second one runs onConfirm.
 */
function DeleteButton({ label, onConfirm, isDeleting = false, disabled = false }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isDeleting) {
    return (
      <button type="button" className="btn btn-danger btn-sm" disabled>
        Eliminando…
      </button>
    );
  }

  if (isConfirming) {
    return (
      <span className="delete-button__confirm">
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => {
            setIsConfirming(false);
            onConfirm();
          }}
          aria-label={`Confirmar eliminación de ${label}`}
        >
          ¿Eliminar?
        </button>{' '}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsConfirming(false)}>
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={() => setIsConfirming(true)}
      disabled={disabled}
      aria-label={`Eliminar ${label}`}
    >
      Eliminar
    </button>
  );
}

export default DeleteButton;
