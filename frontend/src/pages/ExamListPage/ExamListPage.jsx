import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx';
import ExamTable from '../../components/ExamTable/ExamTable.jsx';
import Pagination from '../../components/Pagination/Pagination.jsx';
import TableSkeleton from '../../components/TableSkeleton/TableSkeleton.jsx';
import { parseApiError } from '../../api/errors.js';
import { deleteExam } from '../../api/exams.js';
import { useExams } from '../../hooks/useExams.js';
import './ExamListPage.css';

// Must match REST_FRAMEWORK['PAGE_SIZE'] in backend/config/settings.py.
const PAGE_SIZE = 5;

function ExamListPage() {
  // Page and search live in the URL, so a reload keeps the same view.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1) || 1;
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, error, reload } = useExams({ page, search });
  const [deletingId, setDeletingId] = useState(null);
  // A notice can arrive from the create form through the router state.
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  const handleDelete = async (exam) => {
    setDeletingId(exam.id);
    setNotice(null);
    try {
      await deleteExam(exam.id);
      setNotice({ type: 'success', text: `Se eliminó el examen “${exam.title}”.` });
      // If the last row of a page was removed, DRF would answer 404 for that
      // page, so move one page back; otherwise refresh the current one.
      if (data.results.length === 1 && page > 1) {
        goToPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setNotice({ type: 'error', text: `${parsed.title}: ${parsed.message}` });
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (nextPage) => {
    const params = {};
    if (nextPage > 1) params.page = String(nextPage);
    if (search) params.search = search;
    setSearchParams(params);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchParams(searchInput.trim() ? { search: searchInput.trim() } : {});
  };

  return (
    <section className="exam-list-page">
      <header className="exam-list-page__header">
        <div>
          <h1>Exámenes</h1>
          <p>Datos obtenidos con Axios desde la API de Django (GET /api/exams/).</p>
        </div>
        <Link className="btn btn-primary" to="/exams/new">
          + Nuevo examen
        </Link>
      </header>

      {notice && (
        <div
          className={`exam-list-page__flash${notice.type === 'error' ? ' exam-list-page__flash--error' : ''}`}
          role="status"
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}

      <form className="exam-list-page__search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Buscar por título o descripción…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Buscar exámenes"
        />
        <button type="submit" className="btn btn-secondary">
          Buscar
        </button>
        <button type="button" className="btn btn-secondary" onClick={reload} disabled={isLoading}>
          ↻ Actualizar
        </button>
      </form>

      {renderContent()}
    </section>
  );

  function renderContent() {
    // 1) Error state: takes priority, the user must know the request failed.
    if (error) {
      return <ErrorMessage error={error} onRetry={reload} />;
    }
    // 2) Loading state: nothing to show yet.
    if (isLoading && !data) {
      return <TableSkeleton rows={PAGE_SIZE} />;
    }
    // 3) Data state (empty or with rows).
    if (data.results.length === 0) {
      return (
        <div className="exam-list-page__empty card">
          <h2>No hay exámenes {search ? `para “${search}”` : 'registrados'}</h2>
          <p>Crea el primero desde el formulario de alta.</p>
          <Link className="btn btn-primary" to="/exams/new">
            Crear examen
          </Link>
        </div>
      );
    }
    return (
      <>
        <ExamTable
          exams={data.results}
          onDelete={handleDelete}
          deletingId={deletingId}
          isRefreshing={isLoading}
        />
        <Pagination
          page={page}
          count={data.count}
          pageSize={PAGE_SIZE}
          hasPrevious={Boolean(data.previous)}
          hasNext={Boolean(data.next)}
          onChange={goToPage}
          disabled={isLoading}
        />
      </>
    );
  }
}

export default ExamListPage;
