import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signIn } from "../api/auth/singin";
import { getSession } from "../api/auth/getSession";
import { singout } from "../api/auth/singout";
interface User {
  token: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    setUser(null);
    await singout();
  };

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { data, error } = await getSession();

      if (error) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        const sessionUser = data.session.user;
        const userData = {
          token: data.session.access_token,
          email: sessionUser.email ?? "",
          name: sessionUser.user_metadata?.name ?? "",
        };

        setUser(userData);
        setIsLoading(false);
        return;
      }

      setUser(null);
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    // await new Promise((resolve) => setTimeout(resolve, 800));

    const { data, error } = await signIn(email, password);

    if (error) return false;
    
    console.log(data);

    const userData = {
      token: data.session?.access_token ?? "",
      email: data.user?.email ?? "",
      name: data.user?.user_metadata?.name ?? "",
    };

    setUser(userData);
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
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
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
