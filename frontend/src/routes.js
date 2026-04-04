import { createBrowserRouter } from 'react-router-dom';
import { Root } from './components/Root';
import { Welcome } from './pages/Welcome';
import { SignIn } from './pages/Login';
import { Register } from './pages/Register';
import { Roster } from './pages/Roster';
import { Matches } from './pages/Matches';
import { Standings } from './pages/Standings';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Welcome,
  },
  {
    path: '/login',
    Component: SignIn,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/',
    Component: Root,
    children: [
      { path: 'roster', Component: Roster },
      { path: 'matches', Component: Matches },
      { path: 'standings', Component: Standings },
      { path: 'profile', Component: Profile },
    ],
  },
]);
