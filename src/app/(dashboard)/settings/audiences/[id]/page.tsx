import { db } from "@/lib/db";
import { audiences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { AudienceForm } from "@/features/profile/components/AudienceForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAudiencePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const { id } = await params;

  const audience = await db.query.audiences.findFirst({
    where: and(eq(audiences.id, id), eq(audiences.userId, session.user.id))
  });

  if (!audience) return notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/settings/audiences" className="text-muted-foreground hover:text-foreground">&larr; Back</Link>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Audience</h2>
      </div>
      <AudienceForm initialData={audience} audienceId={audience.id} />
    </div>
  );
}
