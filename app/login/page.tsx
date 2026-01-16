import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading login…</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
