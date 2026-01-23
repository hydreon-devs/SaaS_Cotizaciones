import { useState } from "react";
import { inviteUser } from "@/api/auth/inviteuser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ConfiguracionInvitaciones() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Ingresa un correo");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await inviteUser(email);
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Invitación enviada");
      setEmail("");
      console.log(data);
    } catch {
      toast.error("No se pudo enviar la invitación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Invitaciones</CardTitle>
        <CardDescription>Envía una invitación por correo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            type="email"
            placeholder="email@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar invitación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
