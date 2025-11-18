import AdminNavigation from "./navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 touch-manipulation">
      <AdminNavigation />
     
      <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}

