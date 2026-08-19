import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin Login — Bigg Boss Common Man" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLoginRoute,
});

function AdminLoginRoute() {
  const navigate = useNavigate();
  return <AdminLoginScreen onSuccess={() => navigate({ to: "/admin/reports" })} />;
}
