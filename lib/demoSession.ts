import { cookies } from "next/headers";

export type DemoRole = "workspace_owner" | "super_admin";

export async function getDemoSession() {
  const cookieStore = await cookies();
  const role = cookieStore.get("reachlyst_demo_role")?.value;
  const name = cookieStore.get("reachlyst_demo_name")?.value;

  return {
    role: role === "super_admin" ? "super_admin" as DemoRole : "workspace_owner" as DemoRole,
    name: name ? decodeURIComponent(name) : role === "super_admin" ? "Admin Demo" : "Predrag",
    isSuperAdmin: role === "super_admin"
  };
}
