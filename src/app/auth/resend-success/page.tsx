import { CheckCircle } from 'lucide-react';

export default function ResendSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h1 className="font-semibold text-base text-center">Verification Email Resent</h1>
          <p className="text-sm text-center text-muted-foreground">
            A new verification email has been sent to your inbox.
          </p>
        </div>
      </div>
    </main>
  );
}
