'use client';

import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const dynamic = 'force-dynamic';

const adminTabs = [
  { href: '/admin/submissions', label: 'Submissions' },
  { href: '/admin/signups', label: 'Class Signups' },
  { href: '/admin/prompts', label: 'Prompts' },
  { href: '/admin/businesses', label: 'Businesses' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/howto', label: 'How-To Guides' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-xs">
              {/* Clerk SignIn component will be rendered here */}
              <SignIn />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5 p-3 px-4 bg-white rounded-lg">
          <span className="text-sm text-gray-500">Admin</span>
          <SignOutButton>
            <button className="bg-transparent border border-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-50">
              Sign Out
            </button>
          </SignOutButton>
        </div>

        <Link href="/" className="inline-block mb-5 text-blue-600 font-medium hover:underline">← Back to Website</Link>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {adminTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                pathname === tab.href
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
