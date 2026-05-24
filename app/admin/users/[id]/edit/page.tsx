import { createClient } from "@/lib/supabase/server";
import UserForm from "@/components/admin/UserForm";
import { notFound } from "next/navigation";

export default async function AdminEditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, phone")
    .eq("id", params.id)
    .single();

  if (error || !profile) {
    return notFound();
  }

  return <UserForm profile={profile as any} />;
}
