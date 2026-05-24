export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        {/* ShipperSidebar component goes here */}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          {/* Navbar goes here */}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
