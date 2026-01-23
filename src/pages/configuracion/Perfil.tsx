import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionPerfil() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Gestiona tu información de usuario</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
