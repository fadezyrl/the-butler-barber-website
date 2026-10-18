import type { ReactNode } from "react";

// Admin is client-side auth UI — never statically prerender at build time.
export const dynamic = "force-dynamic";

type AdminRootLayoutProps = {
  children: ReactNode;
};

export default function AdminRootLayout({
  children,
}: AdminRootLayoutProps): React.JSX.Element {
  return <>{children}</>;
}
