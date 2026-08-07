import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = await params;

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
  });

  if (!shortLink?.isActive) {
    redirect("/404");
  }

  if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
    redirect("/404");
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  const forwardedFor = headersList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0] ?? "";

  await db.$transaction([
    db.shortLink.update({
      where: { id: shortLink.id },
      data: { clicks: { increment: 1 } },
    }),
    db.shortLinkClick.create({
      data: {
        shortLinkId: shortLink.id,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        referer: referer ?? null,
      },
    }),
  ]);

  redirect(shortLink.originalUrl);
}
