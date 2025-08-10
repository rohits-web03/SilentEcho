'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigation: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
  isCollapsed?: boolean;
}

export function Sidebar({ className, navigation, isCollapsed = false, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <ScrollArea className="flex-1">
        <nav className={cn(
          'space-y-1 p-2',
          isCollapsed ? 'px-2' : 'px-4'
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md text-sm font-medium transition-colors',
                  'group relative overflow-hidden',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed ? 'h-10 w-10 justify-center p-0' : 'px-3 py-3'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  !isCollapsed && 'mr-3'
                )} />
                <span 
                  className={cn(
                    'whitespace-nowrap transition-opacity duration-200',
                    isCollapsed 
                      ? 'opacity-0 absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap pointer-events-none group-hover:opacity-100 z-50 shadow-md border'
                      : 'opacity-100'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function MobileSidebar({ navigation, className, ...props }: { navigation: SidebarProps['navigation'] } & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  
  return (
    <div className={cn("md:hidden", className)} {...props}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="md:hidden"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent position="left" className="w-[280px] p-0">
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <span className="text-xl font-bold">SilentEcho</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
