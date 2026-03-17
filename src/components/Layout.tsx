import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen mesh-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
