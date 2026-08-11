import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ResultPage from './pages/ResultPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}
