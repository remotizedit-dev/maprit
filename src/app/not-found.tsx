import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-9xl font-black text-slate-200 absolute select-none pointer-events-none">404</div>
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved to a new location.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
