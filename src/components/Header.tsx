import { FileText, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada exitosamente");
    navigate("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-primary font-semibold">
            <FileText className="h-5 w-5" />
            <span>Cotizaciones</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/plantillas"
              className={`text-sm hover:text-primary transition-colors ${
                location.pathname === "/plantillas" ? "text-primary underline underline-offset-4" : "text-muted-foreground"
              }`}
            >
              Plantillas
            </Link>
            <Link
              to="/nueva"
              className={`text-sm hover:text-primary transition-colors ${
                location.pathname === "/nueva" ? "text-primary underline underline-offset-4" : "text-muted-foreground"
              }`}
            >
              Nueva Cotización
            </Link>
            <Link
              to="/"
              className={`text-sm hover:text-primary transition-colors ${
                location.pathname === "/" ? "text-primary underline underline-offset-4" : "text-muted-foreground"
              }`}
            >
              Historial
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto py-1.5 px-3 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user ? getInitials(user.email) : "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{user?.email || "Usuario"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                <Link to="/profile">
                  {user?.email || "email@ejemplo.com"}
                </Link>
              </DropdownMenuItem>
              
              {user?.role === "admin" && <DropdownMenuItem className="text-muted-foreground">
                <Link to="/admin-panel">
                  Panel de administración
                </Link>
              </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
