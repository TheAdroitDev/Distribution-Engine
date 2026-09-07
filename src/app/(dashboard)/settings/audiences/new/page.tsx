import { AudienceForm } from "@/features/profile/components/AudienceForm";
import Link from "next/link";

export default function NewAudiencePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/settings/audiences" className="text-muted-foreground hover:text-foreground">&larr; Back</Link>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Audience</h2>
      </div>
      <AudienceForm />
    </div>
  );
}
