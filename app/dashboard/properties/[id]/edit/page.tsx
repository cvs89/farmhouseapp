import { createClient } from "@/lib/supabase/server";
import OwnerPropertyForm from "@/components/dashboard/OwnerPropertyForm";
import { notFound, redirect } from "next/navigation";

export default async function OwnerEditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .single();

  if (error || !property) {
    return notFound();
  }

  return <OwnerPropertyForm property={property as any} />;
}
