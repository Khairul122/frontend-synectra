import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AlertContainer } from '../ui/Alert';
import { useAlert } from '../../hooks/useAlert';

/**
 * Wrapper layout untuk semua halaman panel.
 * Mengelola state sidebar (open/close) untuk mobile secara terpusat.
 *
 * Usage:
 * <PageLayout user={user} title="Judul Halaman" alert={alert}>
 *   {konten halaman}
 * </PageLayout>
 *
 * Atau dengan alert custom:
 * const alert = useAlert();
 * <PageLayout user={user} title="..." alert={alert}>
 */
export function PageLayout({ user, title, children, alert: externalAlert }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const internalAlert = useAlert();
  const alert = externalAlert ?? internalAlert;

  return (
    <>
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismiss} />

      <div className="flex min-h-screen bg-neu-bg">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main — lg:ml-64 untuk desktop, full width di mobile */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Navbar
            title={title}
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
