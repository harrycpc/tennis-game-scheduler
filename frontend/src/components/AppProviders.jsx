import { AuthProvider } from '../context/AuthContext';
import { DesignProvider } from '../context/DesignContext';

export function AppProviders({ children }) {
  return (
    <DesignProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DesignProvider>
  );
}
