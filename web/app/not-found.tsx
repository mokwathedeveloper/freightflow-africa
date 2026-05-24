import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/dashboard/shipper" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
