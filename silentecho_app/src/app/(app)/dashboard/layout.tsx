'use client';

import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, FileText, Settings, User, Menu, ChevronLeft, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleRouteChange);
    return () => window.removeEventListener('resize', handleRouteChange);
  }, [pathname]);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status !== 'authenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notes', href: '/dashboard/notes', icon: FileText },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div 
          className={cn(
            'fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out',
            'transform',
            sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20',
            'overflow-y-auto',
            'flex flex-col h-[calc(100vh-4rem)] mt-16 bg-background border-r',
            'group'
          )}
        >
          <Sidebar navigation={navigation} isCollapsed={!sidebarOpen} />
          
          {/* Collapse button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center justify-center p-4 text-muted-foreground hover:text-foreground transition-colors border-t"
          >
            <ChevronLeft className={cn(
              'h-5 w-5 transition-transform duration-300',
              !sidebarOpen && 'rotate-180'
            )} />
            <span className="sr-only">Toggle sidebar</span>
          </button>
        </div>
        
        {/* Main content */}
        <main 
          className={cn(
            'flex-1 transition-all duration-300',
            'w-full',
            sidebarOpen ? 'md:ml-64' : 'md:ml-20' // Adjust margin based on sidebar state
          )}
        >
          <div className="min-h-[calc(100vh-4rem)] w-full bg-muted/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Mobile menu toggle button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mb-4 p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </button>
              
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
