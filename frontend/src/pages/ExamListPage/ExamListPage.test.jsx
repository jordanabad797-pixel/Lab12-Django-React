import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteExam, listExams } from '../../api/exams.js';
import ExamListPage from './ExamListPage.jsx';

vi.mock('../../api/exams.js', () => ({
  listExams: vi.fn(),
  deleteExam: vi.fn(),
}));

const page = (results) => ({ count: results.length, next: null, previous: null, results });
const exam = (id, title) => ({
  id,
  title,
  description: '',
  question_count: 0,
  created_at: '2026-11-12T10:00:00Z',
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/exams']}>
      <ExamListPage />
    </MemoryRouter>,
  );

describe('ExamListPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the loading skeleton and then the data table', async () => {
    listExams.mockResolvedValue(page([exam(1, 'Django REST')]));
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando exámenes');
    expect(await screen.findByText('Django REST')).toBeInTheDocument();
    expect(screen.queryByText('Cargando exámenes…')).not.toBeInTheDocument();
  });

  it('shows the error state and retries the request', async () => {
    listExams.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
    listExams.mockResolvedValueOnce(page([exam(2, 'Recovered exam')]));
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo conectar con la API');

    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Recovered exam')).toBeInTheDocument();
    expect(listExams).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state when the API returns no exams', async () => {
    listExams.mockResolvedValue(page([]));
    renderPage();
    expect(await screen.findByText(/No hay exámenes/)).toBeInTheDocument();
  });

  it('deletes an exam and refreshes the list without reloading', async () => {
    listExams
      .mockResolvedValueOnce(page([exam(1, 'Keep me'), exam(2, 'Delete me')]))
      .mockResolvedValueOnce(page([exam(1, 'Keep me')]));
    deleteExam.mockResolvedValue();
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar Delete me' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación de Delete me' }));

    expect(deleteExam).toHaveBeenCalledWith(2);
    await waitFor(() => expect(screen.queryByRole('cell', { name: 'Delete me' })).not.toBeInTheDocument());
    expect(screen.getByText(/Se eliminó el examen/)).toBeInTheDocument();
  });
});
