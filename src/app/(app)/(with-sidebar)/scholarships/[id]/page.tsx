"use client";

import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Calendar, Users, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import GeometricBackground from "~/components/ui/background/geometry";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import MotionImageDialog from "~/components/motion/dialog";

export default function ScholarshipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [scholarship] = api.scholarship.getPublicById.useSuspenseQuery({ id });

  if (!scholarship) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Scholarship Not Found</h1>
        <Button asChild>
          <Link href="/scholarships">Back to Scholarships</Link>
        </Button>
      </div>
    );
  }

  const isEnded = scholarship.deadline < new Date();

  return (
    <div className="relative min-h-screen pb-8">
      <GeometricBackground variant="subtle-glow" />
      
      <div className="container relative z-10 mx-auto max-w-5xl space-y-4">
        <section className="rounded-xl border border-border/80 bg-background/95 p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isEnded ? "destructive" : "default"} className="text-xs md:text-sm">
              {isEnded ? "Closed" : "Open for Application"}
            </Badge>
            <Badge variant="outline" className="text-xs md:text-sm">
              {scholarship.type}
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">{scholarship.title}</h1>
          <p className="mt-1 text-base text-foreground/80 md:text-lg">{scholarship.provider}</p>
        </section>

        {scholarship.image && (
          <section className="relative h-56 w-full overflow-hidden rounded-xl border md:h-80">
            <MotionImageDialog
              layoutId={"hero-image" + scholarship.id}
              src={scholarship.image}
              alt={scholarship.title}
              fill
              className="object-cover"
              priority
            />
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 md:col-span-2">
              <section className="space-y-3 rounded-xl border border-border/80 bg-background/95 p-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  About the Scholarship
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/85">
                  {scholarship.description || "No description provided."}
                </p>
              </section>

              <section className="space-y-3 rounded-xl border border-border/80 bg-background/95 p-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Benefits
                </h2>
                {scholarship.benefits.length > 0 ? (
                  <ul className="grid gap-2">
                    {scholarship.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 rounded-md bg-muted/30 p-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No specific benefits listed.</p>
                )}
              </section>

              <section className="space-y-3 rounded-xl border border-border/80 bg-background/95 p-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="w-5 h-5 text-primary" />
                  Requirements
                </h2>
                {scholarship.requirements.length > 0 ? (
                  <ul className="grid gap-2">
                    {scholarship.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 rounded-md bg-muted/30 p-2.5">
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No specific requirements listed.</p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-5 rounded-xl border border-border/80 bg-background/95 p-4">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="font-semibold">
                          {scholarship.deadline.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quota</p>
                        <p className="font-semibold">
                          {scholarship.quota ? `${scholarship.quota} Students` : "Unlimited / Unspecified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button 
                    className="w-full font-semibold"
                    asChild 
                    disabled={isEnded}
                  >
                    <Link href={scholarship.link} target="_blank" rel="noopener noreferrer">
                      {isEnded ? "Applications Closed" : "Apply Now"}
                    </Link>
                  </Button>
                  {scholarship.otherLinks && scholarship.otherLinks.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-center text-muted-foreground">Additional Resources</p>
                      {scholarship.otherLinks.map((link, idx) => (
                        <Button key={idx} variant="outline" className="w-full justify-start" asChild>
                          <Link href={link} target="_blank" rel="noopener noreferrer">
                            Resource {idx + 1}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
