import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signIn } from "../api/singin";

interface User {
  token: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales de prueba
const TEST_CREDENTIALS = {
  email: "admin@cotizaciones.cl",
  password: "admin123",
  name: "Admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    // await new Promise((resolve) => setTimeout(resolve, 800));

    const { data, error } = await signIn(email, password);

    if (error) return false;
    
    console.log(data);

    const userData = {
      token: data.session?.access_token,
      email: data.user?.email,
      name: data.user?.user_metadata.name,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;

  //   if (
  //     email === TEST_CREDENTIALS.email &&
  //     password === TEST_CREDENTIALS.password
  //   ) {
  //     const userData = {
  //       email: TEST_CREDENTIALS.email,
  //       name: TEST_CREDENTIALS.name,
  //     };
  //     setUser(userData);
  //     localStorage.setItem("user", JSON.stringify(userData));
  //     return true;
  //   }

  //   return false;
  // };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
