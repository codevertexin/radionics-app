import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { RequireSupabaseAuth } from '@/lib/auth/RequireSupabaseAuth';
import IndexPage from '@/pages/IndexPage';
import DashboardPage from '@/pages/DashboardPage';
import SessionsPage from '@/pages/sessions/SessionsPage';
import NewSessionPage from '@/pages/sessions/NewSessionPage';
import WorkspacePage from '@/pages/sessions/WorkspacePage';
import ClientsPage from '@/pages/clients/ClientsPage';
import ClientDetailPage from '@/pages/clients/ClientDetailPage';
import TemplatesPage from '@/pages/templates/TemplatesPage';
import TemplateWizardPage from '@/pages/templates/TemplateWizardPage';
import BuilderPage from '@/pages/templates/BuilderPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import ReportDetailPage from '@/pages/reports/DetailPage';
import ReportPreviewPage from '@/pages/reports/PreviewPage';
import ReportPdfPage from '@/pages/reports/PdfPage';
import ReportGeneratePage from '@/pages/reports/GeneratePage';
import SpecialtiesPage from '@/pages/SpecialtiesPage';
import CertificationsPage from '@/pages/CertificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import LoginPage from '@/pages/auth/LoginPage';

function WithLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function ProtectedWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSupabaseAuth>
      <WithLayout>{children}</WithLayout>
    </RequireSupabaseAuth>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<WithLayout><DashboardPage /></WithLayout>} />
      <Route path="/sessions" element={<WithLayout><SessionsPage /></WithLayout>} />
      <Route path="/sessions/new" element={<ProtectedWithLayout><NewSessionPage /></ProtectedWithLayout>} />
      <Route path="/sessions/:id" element={<WorkspacePage />} />
      <Route path="/sessions/:id/report" element={<WithLayout><ReportGeneratePage /></WithLayout>} />
      <Route path="/clients" element={<WithLayout><ClientsPage /></WithLayout>} />
      <Route path="/clients/:id" element={<WithLayout><ClientDetailPage /></WithLayout>} />
      <Route path="/templates" element={<WithLayout><TemplatesPage /></WithLayout>} />
      <Route path="/templates/new" element={<TemplateWizardPage />} />
      <Route path="/templates/:id/edit" element={<WithLayout><BuilderPage /></WithLayout>} />
      <Route path="/reports" element={<WithLayout><ReportsPage /></WithLayout>} />
      <Route path="/reports/:id/pdf" element={<WithLayout><ReportPdfPage /></WithLayout>} />
      <Route path="/reports/:id/preview" element={<WithLayout><ReportPreviewPage /></WithLayout>} />
      <Route path="/reports/:id" element={<WithLayout><ReportDetailPage /></WithLayout>} />
      <Route path="/specialties" element={<ProtectedWithLayout><SpecialtiesPage /></ProtectedWithLayout>} />
      <Route path="/methodologies" element={<Navigate to="/specialties" replace />} />
      <Route path="/certifications" element={<ProtectedWithLayout><CertificationsPage /></ProtectedWithLayout>} />
      <Route path="/profile" element={<ProtectedWithLayout><ProfilePage /></ProtectedWithLayout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
