import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen w-full mesh-background flex flex-col items-center overflow-x-hidden">
      <Navbar />
      <main className="w-full flex-1 flex flex-col items-center overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
