import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // ✅ YENİ EKLENDİ
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home';
import { Books } from './pages/Books';
import { BookDetail } from './pages/BookDetail';
import { Recommendations } from './pages/Recommendations';
import { ReadingLists } from './pages/ReadingLists';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { ReadingListDetail } from './pages/ReadingListDetail';
import { VerifyEmail } from './pages/VerifyEmail';

/**
 * Main App component with routing and layout
 */
function App() {
  return (
    // ✅ AuthProvider eklendi: Artık Header giriş yapıldığını anlayabilir.
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route
                path="/reading-lists"
                element={
                  <ProtectedRoute>
                    <ReadingLists />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              <Route path="/reading-lists/:id" element={<ReadingListDetail />} />
              <Route path="/verify" element={<VerifyEmail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
