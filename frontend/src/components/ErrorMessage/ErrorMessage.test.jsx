import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorMessage from './ErrorMessage.jsx';

const serverError = {
  kind: 'server',
  title: 'Error interno del servidor',
  message: 'Inténtalo más tarde.',
  status: 500,
};

const networkError = {
  kind: 'network',
  title: 'No se pudo conectar con la API',
  message: 'Comprueba que Django esté en marcha.',
  status: null,
};

describe('ErrorMessage', () => {
  it('is announced as an alert', () => {
    render(<ErrorMessage error={serverError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows the title, message, kind and HTTP status', () => {
    render(<ErrorMessage error={serverError} />);

    expect(screen.getByRole('heading', { name: 'Error interno del servidor' })).toBeInTheDocument();
    expect(screen.getByText('Inténtalo más tarde.')).toBeInTheDocument();
    expect(screen.getByText('server')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Tipo: server · HTTP 500');
  });

  it('says "sin respuesta del servidor" when there is no status', () => {
    render(<ErrorMessage error={networkError} />);

    expect(screen.getByRole('alert')).toHaveTextContent('sin respuesta del servidor');
    expect(screen.getByRole('alert')).not.toHaveTextContent('HTTP');
  });

  it('calls onRetry when Reintentar is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage error={serverError} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show Reintentar without onRetry', () => {
    render(<ErrorMessage error={serverError} />);

    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });
});
