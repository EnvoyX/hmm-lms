import { CircleCheckBig } from 'lucide-react';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface ScholarshipCardProps {
  scholarship: {
    id: string;
    provider: string;
    title: string;
    description: string;
    deadline: Date;
    quota: number | null;
    type: string;
    benefits: string[];
    requirements: string[];
    link: string;
    otherLinks?: string[];
    image?: string | null;
  },
  setScId?: (id: string) => void;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { title, provider, deadline, type, benefits, quota, image } = scholarship;
  return (
    <article className="rounded-lg border border-border/80 bg-background px-4 py-3 transition-colors hover:border-primary/40">
      <div className="flex gap-4">
        {image && (
          <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-md border md:block">
            <Image src={image} alt={title} fill className="object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-2">
                <ScholarshipBadge deadline={deadline} />
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{provider}</p>
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground md:text-lg">
                {title}
              </h3>
            </div>
            <Button className="h-8 px-3 text-xs md:text-sm" size="sm" asChild>
              <Link href={`/scholarships/${scholarship.id}`}>
                Details
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize text-foreground">{type.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium text-foreground">{deadline.toLocaleDateString("id", { dateStyle: 'medium' })}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quota</p>
              <p className="font-medium text-foreground">{quota ?? "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t pt-2 text-xs md:grid-cols-2 md:text-sm">
            {benefits.slice(0, 4).map((benefit, index) => (
              <div className="flex items-start gap-1.5" key={index + benefit}>
                <CircleCheckBig className='mt-0.5 shrink-0 text-primary' size={13} />
                <p className="line-clamp-1 text-foreground/85">{benefit}</p>
              </div>
            ))}
            {benefits.length > 4 && (
              <p className="text-xs text-muted-foreground italic">+ {benefits.length - 4} more benefits</p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ScholarshipBadge({ deadline }: { deadline: Date }) {
  const isEnded = deadline < new Date();
  return (
    <span className={`${isEnded ? "bg-muted text-muted-foreground" : "bg-emerald-600 text-white"} rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide`}>
      {isEnded ? "CLOSED" : "OPEN"}
    </span>
  )
}