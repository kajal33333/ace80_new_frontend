import AuthLayout from "@/components/auth/layout.jsx/auth-layout";

export default function RootLayout({ children }) {
  return (
    <>
      <AuthLayout>{children}</AuthLayout>
    </>
  );
}
