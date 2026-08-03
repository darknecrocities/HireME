import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { PagePresence, ScrollProgress } from './Motion';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div className="app-shell min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      <ScrollToTop />
      <ScrollProgress />
      <Navbar />
      <main className="w-full flex-1 flex flex-col items-center overflow-x-hidden">
        <PagePresence>
          <Outlet />
        </PagePresence>
      </main>
    </div>
  );
}
