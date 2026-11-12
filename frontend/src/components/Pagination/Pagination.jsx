import './Pagination.css';

/** Navigation over the DRF PageNumberPagination envelope. */
function Pagination({ page, count, pageSize, hasPrevious, hasNext, onChange, disabled = false }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <nav className="pagination" aria-label="Paginación">
      <span>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong> · {count} examen(es)
      </span>
      <div className="pagination__buttons">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!hasPrevious || disabled}
          onClick={() => onChange(page - 1)}
        >
          ← Anterior
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!hasNext || disabled}
          onClick={() => onChange(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
