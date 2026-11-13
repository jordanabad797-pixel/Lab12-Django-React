import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination.jsx';

// 25 exams at 10 per page -> 3 pages.
const renderPagination = (props = {}) => {
  const onChange = vi.fn();
  render(
    <Pagination
      page={2}
      count={25}
      pageSize={10}
      hasPrevious
      hasNext
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange };
};

const previousButton = () => screen.getByRole('button', { name: /Anterior/ });
const nextButton = () => screen.getByRole('button', { name: /Siguiente/ });

describe('Pagination', () => {
  it('shows "Página X de Y"', () => {
    renderPagination();

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toHaveTextContent(
      'Página 2 de 3 · 25 examen(es)',
    );
  });

  it('disables Anterior on the first page', () => {
    renderPagination({ page: 1, hasPrevious: false });

    expect(previousButton()).toBeDisabled();
    expect(nextButton()).toBeEnabled();
  });

  it('disables Siguiente on the last page', () => {
    renderPagination({ page: 3, hasNext: false });

    expect(nextButton()).toBeDisabled();
    expect(previousButton()).toBeEnabled();
  });

  it('calls onChange with the previous and next page', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPagination();

    await user.click(previousButton());
    expect(onChange).toHaveBeenLastCalledWith(1);

    await user.click(nextButton());
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
