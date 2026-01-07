import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
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
import { ForgotPassword } from './pages/ForgotPassword';

/**
 * Main App component with routing, layout and notifications
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global bildirim konteynırı - Ekranın üstünde mesajları gösterir */}
        <Toaster position="top-right" reverseOrder={false} />

        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              {/* Sadece giriş yapmış kullanıcılar görebilir */}
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* SADECE ADMIN rolüne sahip kullanıcılar girebilir */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/reading-lists/:id" element={<ReadingListDetail />} />
              <Route path="/verify" element={<VerifyEmail />} />
              {/* Hatalı URL'ler için 404 sayfası */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
