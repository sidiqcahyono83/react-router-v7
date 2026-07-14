import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { LoginForm } from "./LoginForm";

export function LoginCard() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Teranet Billing
        </CardTitle>

        <p className="text-center text-sm text-muted-foreground">
          Silakan login untuk melanjutkan
        </p>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
