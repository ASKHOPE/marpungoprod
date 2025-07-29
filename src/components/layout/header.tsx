
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Laptop, Menu, LayoutGrid, User, LogIn, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/events', label: 'Events' },
  { href: '/donate', label: 'Donate' },
  { href: '/volunteer', label: 'Volunteer' },
];

export default function Header() {
  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        {/* Row 1: Logo and Mobile Menu Trigger */}
        <div className="flex h-16 items-center justify-between md:justify-center">
          {/* Logo Area - visible on all screen sizes, behavior changes */}
          <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2 lg:static lg:left-auto lg:translate-x-0">
            <Link href="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
              <Image
                src="/logo.png" // Assuming your logo is public/logo.png
                alt="Marpu Logo"
                width={28} // Adjust width as needed
                height={28} // Adjust height as needed
                className="mr-2"
              />
              <span className="font-headline text-2xl font-bold">MARPU</span>
            </Link>
          </div>

          {/* Mobile Menu Sheet Trigger - only shown on mobile */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center space-x-2 text-primary">
                      <Image
                        src="/logo.png"
                        alt="Marpu Logo"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      <span className="font-headline text-xl font-bold">Marpu</span>
                    </Link>
                  </SheetClose>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <nav className="flex-grow p-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.label}>
                        <Link
                          href={item.href}
                          className="block text-lg text-foreground/80 hover:text-primary transition-colors py-2"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                    <hr className="my-3 border-border" />
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center text-lg text-foreground/80 hover:text-primary transition-colors py-2"
                        >
                          <LayoutGrid className="mr-3 h-5 w-5" /> Admin Dashboard
                        </Link>
                      </SheetClose>
                    )}
                    {!isLoadingSession && (
                      isAuthenticated ? (
                        <>
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-start text-lg text-foreground/80 hover:text-primary transition-colors py-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:text-primary"
                            onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                          >
                            <LogOut className="mr-3 h-5 w-5" /> Sign Out
                          </Button>
                        </>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            href="/login"
                            className="flex items-center text-lg text-foreground/80 hover:text-primary transition-colors py-2"
                          >
                            <LogIn className="mr-3 h-5 w-5" /> Login
                          </Link>
                        </SheetClose>
                      )
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Row 2: Navigation and Actions - Only for Desktop */}
        <div className="hidden md:flex h-16 items-center justify-between border-t border-border/40">
          <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-foreground/80 hover:text-primary transition-colors"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {isAdmin && (
              <Link href="/admin/dashboard" passHref>
                <Button variant="ghost" size="icon" aria-label="Admin Dashboard">
                  <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Admin Dashboard</span>
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle theme">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Laptop className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isLoadingSession && (
              isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                        <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Open user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start !text-muted-foreground !opacity-100 cursor-default hover:!bg-transparent">
                      <p className="text-sm font-medium text-foreground">{session.user?.name}</p>
                      <p className="text-xs">{session.user?.email}</p>
                      {session.user?.role && <p className="text-xs capitalize">Role: {session.user.role}</p>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" passHref>
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-2 h-[1.2rem] w-[1.2rem]" /> Login
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
