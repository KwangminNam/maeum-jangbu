"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { client } from "@/lib/fetch-client";

function AuthTokenSetter({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      client.setAuthToken(session.accessToken);
    } else {
      client.setAuthToken(null);
    }
  }, [session?.accessToken]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthTokenSetter>{children}</AuthTokenSetter>
    </SessionProvider>
  );
}
