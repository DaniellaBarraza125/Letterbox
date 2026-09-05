import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Has cerrado sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Hasta pronto. Las cartas te estarán esperando.
          </p>
          <Link href="/login">
            <Button className="w-full">Volver a entrar</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
