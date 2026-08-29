import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ReconstructPage from './pages/ReconstructPage';
import ExercisesPage from './pages/ExercisesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import { FontSizeProvider } from './context/FontSizeContext';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import RequireAdmin from './components/RequireAdmin';
import AdminAddExercisePage from './pages/AdminAddExercisePage';


function App() {
  return (
    <FontSizeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reconstruct" element={<ReconstructPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/verify" element={<VerifyPage />} />
            <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin/exercises/new" 
            element={ 
              <RequireAdmin> 
                <AdminAddExercisePage /> 
                </RequireAdmin>} 
              /> 
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    </FontSizeProvider>
  );
}

export default App;