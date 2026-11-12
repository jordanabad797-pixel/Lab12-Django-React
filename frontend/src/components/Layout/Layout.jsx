import { NavLink, Outlet } from 'react-router-dom';
import { API_BASE_URL } from '../../api/config.js';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__brand">
          <span className="layout__logo">Q</span>
          <div>
            <strong>Quiz Center</strong>
            <small>Cliente React · API Django REST</small>
          </div>
        </div>
        <nav className="layout__nav">
          <NavLink to="/exams" end>
            Exámenes
          </NavLink>
          <NavLink to="/exams/new">Nuevo examen</NavLink>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">
        API: <code>{API_BASE_URL}</code>
      </footer>
    </div>
  );
}

export default Layout;
