import AdminLayout from "@/components/admin/layout/layout";

export default function RootLayout({ children }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
