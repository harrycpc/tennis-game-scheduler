import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AppProviders } from './components/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
