import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteButton from './DeleteButton.jsx';

const renderButton = (props = {}) => {
  const onConfirm = vi.fn();
  render(<DeleteButton label="Django REST" onConfirm={onConfirm} {...props} />);
  return { onConfirm };
};

const deleteButton = () => screen.getByRole('button', { name: 'Eliminar Django REST' });
const confirmButton = () =>
  screen.getByRole('button', { name: 'Confirmar eliminación de Django REST' });

describe('DeleteButton', () => {
  it('asks for confirmation on the first click without calling onConfirm', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderButton();

    await user.click(deleteButton());

    expect(confirmButton()).toHaveTextContent('¿Eliminar?');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('goes back to the initial state when Cancelar is clicked', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderButton();

    await user.click(deleteButton());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(deleteButton()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm exactly once when confirmed', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderButton();

    await user.click(deleteButton());
    await user.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(deleteButton()).toBeInTheDocument();
  });

  it('shows a disabled "Eliminando…" button while isDeleting', () => {
    renderButton({ isDeleting: true });

    const button = screen.getByRole('button', { name: 'Eliminando…' });
    expect(button).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Eliminar Django REST' })).not.toBeInTheDocument();
  });
});
