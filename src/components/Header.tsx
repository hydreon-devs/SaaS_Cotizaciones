import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();

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
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>CM</AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground">Carlos Méndez</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
