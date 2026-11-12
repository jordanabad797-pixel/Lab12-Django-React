import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createExam } from '../../api/exams.js';
import ExamFormPage from './ExamFormPage.jsx';

vi.mock('../../api/exams.js', () => ({ createExam: vi.fn() }));

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/exams/new']}>
      <Routes>
        <Route path="/exams/new" element={<ExamFormPage />} />
        <Route path="/exams" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ExamFormPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the validation message returned by the API', async () => {
    createExam.mockRejectedValue({
      response: { status: 400, data: { title: ['El título es obligatorio.'] } },
    });
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Guardar examen' }));

    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toHaveAttribute('aria-invalid', 'true');
  });

  it('posts the controlled values and navigates to the list', async () => {
    createExam.mockResolvedValue({ id: 7, title: 'Axios 101' });
    renderForm();

    await userEvent.type(screen.getByLabelText('Título *'), 'Axios 101');
    await userEvent.type(screen.getByLabelText('Descripción'), 'GET, POST y DELETE');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar examen' }));

    expect(createExam).toHaveBeenCalledWith({ title: 'Axios 101', description: 'GET, POST y DELETE' });
    expect(await screen.findByText('Listado')).toBeInTheDocument();
  });

  it('shows the connection error when the API is unreachable', async () => {
    createExam.mockRejectedValue({ code: 'ERR_NETWORK' });
    renderForm();

    await userEvent.type(screen.getByLabelText('Título *'), 'Offline exam');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar examen' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con la API');
  });
});
