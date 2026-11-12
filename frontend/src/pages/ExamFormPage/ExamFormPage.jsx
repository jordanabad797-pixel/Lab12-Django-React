import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parseApiError } from '../../api/errors.js';
import { createExam } from '../../api/exams.js';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage.jsx';
import './ExamFormPage.css';

const EMPTY_FORM = { title: '', description: '' };

function ExamFormPage() {
  const navigate = useNavigate();
  // Controlled inputs: React state is the single source of truth.
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fieldErrors = error?.fieldErrors ?? {};

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // stop the browser's own form submission
    setIsSubmitting(true);
    setError(null);
    try {
      // Validation is intentionally left to the API: its 400 messages
      // are rendered next to each field.
      const created = await createExam(form);
      navigate('/exams', {
        state: { notice: { type: 'success', text: `Se creó el examen “${created.title}” (#${created.id}).` } },
      });
    } catch (err) {
      setError(parseApiError(err));
      setIsSubmitting(false);
    }
  };

  return (
    <section className="exam-form-page">
      <header className="exam-form-page__header">
        <h1>Nuevo examen</h1>
        <p>Envía un POST /api/exams/ con Axios. La API valida los datos.</p>
      </header>

      {error && error.kind !== 'validation' && <ErrorMessage error={error} />}

      <form className="exam-form card" onSubmit={handleSubmit} noValidate>
        {error?.kind === 'validation' && (
          <div className="exam-form__summary" role="alert">
            <strong>{error.title}.</strong> {error.message}
          </div>
        )}

        <div className={`exam-form__field${fieldErrors.title ? ' exam-form__field--invalid' : ''}`}>
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej.: Consumo de APIs con Axios"
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            disabled={isSubmitting}
          />
          {fieldErrors.title && (
            <p id="title-error" className="exam-form__error">
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div className={`exam-form__field${fieldErrors.description ? ' exam-form__field--invalid' : ''}`}>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Tema, alcance o indicaciones del examen"
            disabled={isSubmitting}
          />
          {fieldErrors.description && <p className="exam-form__error">{fieldErrors.description}</p>}
        </div>

        <div className="exam-form__actions">
          <Link className="btn btn-secondary" to="/exams">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar examen'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ExamFormPage;
