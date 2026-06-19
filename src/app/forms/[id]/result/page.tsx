import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function FormResultPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <CardTitle className="mt-4 text-2xl">Thank You!</CardTitle>
          <CardDescription>Your response has been successfully submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}