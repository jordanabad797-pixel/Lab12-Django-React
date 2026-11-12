import apiClient from './client.js';

const EXAMS_PATH = '/exams/';

/**
 * GET /api/exams/?page=&search=
 * Returns the DRF paginated envelope: { count, next, previous, results }.
 */
export async function listExams({ page = 1, search = '', signal } = {}) {
  const params = { page };
  if (search.trim()) {
    params.search = search.trim();
  }
  const response = await apiClient.get(EXAMS_PATH, { params, signal });
  return response.data;
}

/** POST /api/exams/ with { title, description }. Returns the created exam. */
export async function createExam(exam) {
  const response = await apiClient.post(EXAMS_PATH, exam);
  return response.data;
}

/** DELETE /api/exams/:id/ (204 No Content). */
export async function deleteExam(id) {
  await apiClient.delete(`${EXAMS_PATH}${id}/`);
}
