import { describe, expect, it } from 'vitest';
import { ERROR_KIND, parseApiError } from './errors.js';

const httpError = (status, data) => ({ response: { status, data } });

describe('parseApiError', () => {
  it('treats a missing response as a network / CORS failure', () => {
    const error = parseApiError({ code: 'ERR_NETWORK', message: 'Network Error' });
    expect(error.kind).toBe(ERROR_KIND.NETWORK);
    expect(error.status).toBeNull();
    expect(error.message).toMatch(/CORS/);
  });

  it('maps DRF 400 bodies to field errors', () => {
    const error = parseApiError(httpError(400, { title: ['El título es obligatorio.'] }));
    expect(error.kind).toBe(ERROR_KIND.VALIDATION);
    expect(error.fieldErrors).toEqual({ title: 'El título es obligatorio.' });
  });

  it('keeps non_field_errors as the general message', () => {
    const error = parseApiError(httpError(400, { non_field_errors: ['Datos inválidos.'] }));
    expect(error.message).toBe('Datos inválidos.');
    expect(error.fieldErrors).toEqual({});
  });

  it.each([401, 403])('maps %i to an authorization error', (status) => {
    const error = parseApiError(httpError(status, { detail: 'Sin credenciales.' }));
    expect(error.kind).toBe(ERROR_KIND.AUTH);
    expect(error.message).toBe('Sin credenciales.');
  });

  it('maps 5xx to a server error', () => {
    expect(parseApiError(httpError(500, '<html>')).kind).toBe(ERROR_KIND.SERVER);
  });

  it('detects timeouts', () => {
    expect(parseApiError({ code: 'ECONNABORTED' }).kind).toBe(ERROR_KIND.TIMEOUT);
  });

  it('ignores cancelled requests', () => {
    expect(parseApiError({ code: 'ERR_CANCELED' })).toBeNull();
  });
});
