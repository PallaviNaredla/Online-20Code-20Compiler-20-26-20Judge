import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))] text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-fuchsia-500 to-sky-500" />
            <span className="font-extrabold tracking-tight text-xl">AlgoJudge</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavItem to="/" label="Playground" />
            <NavItem to="/submissions" label="Submissions" />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-border mt-10 py-6 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <p>© {new Date().getFullYear()} AlgoJudge</p>
          <p>Java · Python · Node.js · MongoDB · React</p>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
          isActive && "bg-primary/10 text-primary"
        )
      }
      end
    >
      {label}
    </NavLink>
  );
}
