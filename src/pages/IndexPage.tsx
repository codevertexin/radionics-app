import { Navigate } from 'react-router-dom';

/** Landing — redirects to dashboard (onboarding can be added later). */
export default function IndexPage() {
  return <Navigate to="/dashboard" replace />;
}
