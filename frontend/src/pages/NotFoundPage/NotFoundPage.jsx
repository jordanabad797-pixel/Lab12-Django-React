import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="card" style={{ padding: 32, textAlign: 'center' }}>
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no existe en el cliente.</p>
      <Link className="btn btn-primary" to="/exams">
        Volver al listado
      </Link>
    </section>
  );
}

export default NotFoundPage;
