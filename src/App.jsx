import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import PortfolioPage     from './pages/PortfolioPage';
import PortfolioFormPage from './pages/PortfolioFormPage';
import BannerPage        from './pages/BannerPage';
import BannerFormPage    from './pages/BannerFormPage';
import NotFoundPage      from './pages/NotFoundPage';
import ServerErrorPage   from './pages/ServerErrorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/register"           element={<RegisterPage />} />
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/portfolio"          element={<PortfolioPage />} />
        <Route path="/portfolio/new"      element={<PortfolioFormPage />} />
        <Route path="/portfolio/:id/edit" element={<PortfolioFormPage />} />
        <Route path="/banners"            element={<BannerPage />} />
        <Route path="/banners/new"        element={<BannerFormPage />} />
        <Route path="/banners/:id/edit"   element={<BannerFormPage />} />
        <Route path="/500"                element={<ServerErrorPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
