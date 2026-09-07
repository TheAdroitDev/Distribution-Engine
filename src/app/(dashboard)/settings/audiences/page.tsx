import { db } from "@/lib/db";
import { audiences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AudiencesSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const userAudiences = await db.query.audiences.findMany({
    where: eq(audiences.userId, session.user.id),
    orderBy: (audiences, { desc }) => [desc(audiences.createdAt)]
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/settings/profile" className="text-muted-foreground pb-1">Profile</Link>
        <Link href="/settings/audiences" className="font-bold border-b-2 border-primary pb-1">Audiences</Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audiences</h2>
          <p className="text-muted-foreground mt-1">
            Manage your target audiences.
          </p>
        </div>
        <Link href="/settings/audiences/new" className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
          Create Audience
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {userAudiences.length === 0 ? (
          <p className="text-muted-foreground">No audiences defined yet.</p>
        ) : (
          userAudiences.map((aud) => (
            <Card key={aud.id} className="flex flex-col relative group">
              <Link href={`/settings/audiences/${aud.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">Edit Audience</span>
              </Link>
              <CardHeader>
                <CardTitle>{aud.name}</CardTitle>
                {aud.description && <p className="text-sm text-muted-foreground line-clamp-2">{aud.description}</p>}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Interests:</strong> {aud.interests.join(", ") || "None"}
                </div>
                <div>
                  <strong>Problems:</strong> {aud.problems.join(", ") || "None"}
                </div>
                <div>
                  <strong>Platforms:</strong> {aud.platformAffinity.join(", ") || "None"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
