import { createClient } from "@/lib/supabase/server";
import ConvertInquiryForm from "@/components/admin/ConvertInquiryForm";
import { notFound } from "next/navigation";

export default async function AdminConvertInquiryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch inquiry with property configurations
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select("*, properties(*)")
    .eq("id", params.id)
    .single();

  if (error || !inquiry) {
    return notFound();
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <ConvertInquiryForm inquiry={inquiry as any} />
    </div>
  );
}
