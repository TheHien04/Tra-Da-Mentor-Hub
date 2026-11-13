import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import { PageTitleSync } from './components/PageTitleSync';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

/** Application composition root. Providers live here; layout and routes live in `src/app`. */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <PageTitleSync />
            <AppShell />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
