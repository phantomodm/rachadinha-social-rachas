
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Zap, Store, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Início", icon: Home, auth: false },
  { href: "/contacts", label: "Contatos", icon: Users, auth: true },
  { href: "/create-rachadinha", label: "Rachar", icon: Zap, auth: true },
  { href: "/store", label: "Loja", icon: Store, auth: false },
  { href: "/support", label: "Ajuda", icon: LifeBuoy, auth: false },
];

const TabBar = () => {
  const location = useLocation();
  const { session } = useAuth();

  const visibleItems = navItems.filter(item => !item.auth || session);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/80 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] flex md:hidden z-50">
      <div className="flex justify-around w-full">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 pt-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
