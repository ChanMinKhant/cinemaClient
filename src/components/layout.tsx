import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Ticket, Film } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const [location] = useLocation();

  if (!user) {
    return <main className="min-h-screen bg-background text-foreground">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              LUMINA <span className="text-primary">CINEMA</span>
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground hidden md:block">
              Welcome, <span className="text-foreground font-medium">{user.username}</span>
            </span>
            
            {user.role === "admin" && (
              <Link href="/admin">
                <Button 
                  variant={location === "/admin" ? "default" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            )}

            {user.role === "user" && (
              <Link href="/booking">
                <Button 
                  variant={location === "/booking" ? "default" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets
                </Button>
              </Link>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="gap-2 border-white/10 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t border-white/5 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Lumina Cinema. All rights reserved.
      </footer>
    </div>
  );
}
