import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';

export type { Language } from '@/shared/types';

export default function App() {
  return <RouterProvider router={router} />;
}
