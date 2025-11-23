"use client";

import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Calendar, Users, CheckCircle2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen pb-8 relative">
      <GeometricBackground variant="subtle-glow" />
      
      <div className="container max-w-5xl mx-auto relative z-10">
        <div className="bg-card rounded-md overflow-hidden border shadow-xl">
          {/* Hero Section */}
          <div className="relative h-64 md:h-80 w-full bg-muted">
            {scholarship.image ? (
              <MotionImageDialog
                layoutId={"hero-image"+scholarship.id}
                src={scholarship.image}
                alt={scholarship.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <FileText className="w-24 h-24 text-primary/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 pointer-events-none">
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant={isEnded ? "destructive" : "default"} className="text-sm px-3 py-1">
                  {isEnded ? "Closed" : "Open for Application"}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-background/50 backdrop-blur-sm">
                  {scholarship.type}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">{scholarship.title}</h1>
              <p className="text-xl text-muted-foreground font-medium">{scholarship.provider}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 p-6 md:p-10">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  About the Scholarship
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {scholarship.description || "No description provided."}
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Benefits
                </h2>
                {scholarship.benefits.length > 0 ? (
                  <ul className="grid gap-3">
                    {scholarship.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No specific benefits listed.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Requirements
                </h2>
                {scholarship.requirements.length > 0 ? (
                  <ul className="grid gap-3">
                    {scholarship.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
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
              <div className="bg-muted/30 rounded-2xl p-6 border space-y-6 sticky top-24">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Key Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
                    className="w-full"
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
                        <Button key={idx} variant="outline" className="w-full" asChild>
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
    </div>
  );
}
