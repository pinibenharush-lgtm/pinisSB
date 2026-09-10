import { IdentityProvider } from "@/lib/identity";
import AppShell from "@/components/AppShell";

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <IdentityProvider>
      <AppShell>{children}</AppShell>
    </IdentityProvider>
  );
}
