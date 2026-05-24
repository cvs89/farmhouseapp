import { createClient } from "@/lib/supabase/server";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function AdminNewPropertyPage() {
  const supabase = createClient();

  const { data: ownersData } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .or("role.eq.owner,role.eq.admin")
    .order("full_name", { ascending: true });

  const owners = ownersData || [];

  return <PropertyForm owners={owners} />;
}
