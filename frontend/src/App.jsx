import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import ExamListPage from './pages/ExamListPage/ExamListPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/exams" replace />} />
        <Route path="exams" element={<ExamListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
