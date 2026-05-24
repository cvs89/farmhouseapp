import { createClient } from "@/lib/supabase/server";
import PropertyForm from "@/components/admin/PropertyForm";
import { notFound } from "next/navigation";

export default async function AdminEditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !property) {
    return notFound();
  }

  const { data: ownersData } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .or("role.eq.owner,role.eq.admin")
    .order("full_name", { ascending: true });

  const owners = ownersData || [];

  return <PropertyForm owners={owners} property={property as any} />;
}
