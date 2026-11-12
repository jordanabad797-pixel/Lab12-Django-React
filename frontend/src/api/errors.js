import axios from 'axios';

/**
 * Error kinds the UI knows how to explain. A request can fail before
 * reaching Django (network/CORS), be rejected by it (4xx) or break inside it (5xx).
 */
export const ERROR_KIND = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  VALIDATION: 'validation',
  AUTH: 'auth',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

const TITLES = {
  [ERROR_KIND.NETWORK]: 'No se pudo conectar con la API',
  [ERROR_KIND.TIMEOUT]: 'La API tardó demasiado en responder',
  [ERROR_KIND.VALIDATION]: 'Revisa los datos del formulario',
  [ERROR_KIND.AUTH]: 'No tienes permiso para esta operación',
  [ERROR_KIND.NOT_FOUND]: 'El recurso ya no existe',
  [ERROR_KIND.SERVER]: 'Error interno del servidor',
  [ERROR_KIND.UNKNOWN]: 'Ocurrió un error inesperado',
};

/**
 * Converts any Axios error into a plain object the components can render:
 * { kind, title, message, status, fieldErrors }.
 */
export function parseApiError(error) {
  if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED') {
    return null;
  }

  const status = error?.response?.status ?? null;
  const data = error?.response?.data;

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return build(ERROR_KIND.TIMEOUT, 'Vuelve a intentarlo en unos segundos.', status);
  }

  // No response at all: the server is down, the URL is wrong or the browser
  // blocked the answer because of CORS. JavaScript cannot tell them apart.
  if (!error?.response) {
    return build(
      ERROR_KIND.NETWORK,
      'El servidor de Django no responde o el navegador bloqueó la respuesta por CORS. '
        + 'Verifica que "python manage.py runserver" esté activo y que este origen esté autorizado.',
      status,
    );
  }

  if (status === 400) {
    const { fieldErrors, general } = splitValidationErrors(data);
    return build(ERROR_KIND.VALIDATION, general || 'La API rechazó los datos enviados.', status, fieldErrors);
  }
  if (status === 401 || status === 403) {
    return build(
      ERROR_KIND.AUTH,
      data?.detail || 'Configura VITE_API_TOKEN con el token del usuario profe.',
      status,
    );
  }
  if (status === 404) {
    return build(ERROR_KIND.NOT_FOUND, data?.detail || 'Actualiza el listado.', status);
  }
  if (status >= 500) {
    return build(ERROR_KIND.SERVER, `La API respondió ${status}. Revisa la consola de Django.`, status);
  }
  return build(ERROR_KIND.UNKNOWN, data?.detail || error?.message || 'Sin detalle.', status);
}

/** DRF validation body: { field: ["msg"], non_field_errors: ["msg"] }. */
function splitValidationErrors(data) {
  const fieldErrors = {};
  let general = '';
  if (data && typeof data === 'object') {
    for (const [field, messages] of Object.entries(data)) {
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
      if (field === 'non_field_errors' || field === 'detail') {
        general = text;
      } else {
        fieldErrors[field] = text;
      }
    }
  }
  return { fieldErrors, general };
}

function build(kind, message, status, fieldErrors = {}) {
  return { kind, title: TITLES[kind], message, status, fieldErrors };
}
