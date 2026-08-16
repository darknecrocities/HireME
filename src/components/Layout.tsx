import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { PagePresence, ScrollProgress } from './Motion';
import ScrollToTop from './ScrollToTop';
import CursorEffect from './CursorEffect';
import AudioSettingsModal from './AudioSettingsModal';

export default function Layout() {
  return (
    <div className="app-shell min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      <CursorEffect />
      <ScrollToTop />
      <ScrollProgress />
      <Navbar />
      <AudioSettingsModal />
      <main className="w-full flex-1 flex flex-col items-center overflow-x-hidden">
        <PagePresence>
          <Outlet />
        </PagePresence>
      </main>
    </div>
  );
}

