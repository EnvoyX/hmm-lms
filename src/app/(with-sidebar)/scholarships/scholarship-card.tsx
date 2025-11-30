import { CircleCheckBig } from 'lucide-react';
import GeometricBackground from '~/components/ui/background/geometry';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
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
    <Card className='flex flex-col md:flex-row gap-0 relative overflow-hidden'>
      <GeometricBackground className='' variant='subtle-glow' />

      {/* Image Section */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No Image
            </div>
        )}
        <ScholarshipBadge deadline={deadline} />
      </div>

      {/* Content Section */}
      <CardContent className='flex flex-col p-4 md:p-6 w-full z-10 gap-4'>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">{provider}</h2>
            <CardTitle className='text-lg md:text-xl leading-tight'>
              {title}
            </CardTitle>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-medium capitalize">{type.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Deadline</p>
            <p className="font-medium">{deadline.toLocaleDateString("id", { dateStyle: 'medium' })}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Quota</p>
            <p className="font-medium">{quota ?? "-"}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Benefits</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {benefits.slice(0, 4).map((benefit, index) => (
              <div className="flex gap-2 items-start" key={index + benefit}>
                <CircleCheckBig className='text-primary shrink-0 mt-0.5' size={14} />
                <p className="line-clamp-1 text-muted-foreground">{benefit}</p>
              </div>
            ))}
            {benefits.length > 4 && (
              <p className="text-xs text-muted-foreground italic">+ {benefits.length - 4} more benefits</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-2">
          <Button className='w-full md:w-auto' size='sm' variant='default' asChild>
            <Link href={`/scholarships/${scholarship.id}`}>
              Read More
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ScholarshipBadge({ deadline }: { deadline: Date }) {
  const isEnded = deadline < new Date();
  return (
    <div className={`${!isEnded ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"} absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded shadow-sm z-20`}>
      {isEnded ? "CLOSED" : "CLOSING SOON"}
    </div>
  )
}