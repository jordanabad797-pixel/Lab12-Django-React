import './ExamTable.css';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Data state: renders the exams returned by the API. */
function ExamTable({ exams, isRefreshing = false }) {
  return (
    <div className={`exam-table card${isRefreshing ? ' exam-table--refreshing' : ''}`}>
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Título</th>
            <th scope="col">Descripción</th>
            <th scope="col">Preguntas</th>
            <th scope="col">Creado</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td className="exam-table__id">#{exam.id}</td>
              <td className="exam-table__title">{exam.title}</td>
              <td className="exam-table__description">{exam.description || '—'}</td>
              <td>
                <span className="exam-table__badge">{exam.question_count}</span>
              </td>
              <td className="exam-table__date">{dateFormatter.format(new Date(exam.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExamTable;
