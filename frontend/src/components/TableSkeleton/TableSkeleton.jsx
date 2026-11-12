import './TableSkeleton.css';

/** Loading state: placeholder rows shown until the first response arrives. */
function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="table-skeleton card" role="status" aria-busy="true" aria-live="polite">
      <span className="table-skeleton__label">Cargando exámenes…</span>
      {Array.from({ length: rows }, (_, row) => (
        <div className="table-skeleton__row" key={row}>
          {Array.from({ length: columns }, (__, col) => (
            <span
              className="table-skeleton__cell"
              key={col}
              style={{ width: `${col === 1 ? 34 : 10 + ((row + col) % 3) * 5}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
