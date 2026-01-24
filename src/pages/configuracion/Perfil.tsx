import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getProfile } from "@/api/auth/getProfile";


interface Profile {
    userName: string;
    email: string;
    role: string;
}

export default function ConfiguracionPerfil() {
  const [Profile, setProfile] = useState<Profile | null>(null);
  

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const user = await getProfile();
        if (!isMounted) return;
        
        setProfile(user);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "No se pudo cargar el perfil");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="max-w-xl">
      <CardHeader>  
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Gestiona tu información de usuario</CardDescription>
      </CardHeader>
      <form onSubmit={(e) => e.preventDefault()}>
        <CardContent>
          <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={Profile?.userName}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={Profile?.email} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Rol</Label>
              <Input id="role" type="text" value={Profile?.role} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            Guardar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
