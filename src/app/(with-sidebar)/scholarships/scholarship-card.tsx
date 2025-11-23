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
    <Card className='gap-2 relative'>
      <GeometricBackground className='' variant='subtle-glow' />
      <ScholarshipBadge deadline={deadline} />
      <CardHeader className='z-10'>
        {image && (
          <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardTitle className='md:text-lg'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex z-10'>
        <div className="w-3/5 space-y-2">
          <h2 className="text-primary capitalize">{provider}</h2>
          <p className="text-muted-foreground">Scholarship Type: <span className='text-primary capitalize'>{type.toLowerCase()}</span></p>
          <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-1">
            {benefits.map((benefit, index) => (
              <div className="flex gap-2 items-center" key={index + benefit}>
                <CircleCheckBig className='' size={14} />
                <p className="">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
        <Separator orientation='vertical' className='min-w-1 bg-black' />
        <div className="flex-1">
          <p className="text-muted-foreground">
            Deadline
          </p>
          <h2 className="">{deadline.toLocaleDateString("id", { dateStyle: 'medium' })}</h2>
          <p className="text-muted-foreground mt-2">
            Quota
          </p>
          <h2 className="">{quota ?? "-"}</h2>
          <Button className='mt-4 w-full' size='lg' variant='default' asChild>
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
    <div className={`${!isEnded ? "bg-destructive/10 text-destructive border-destructive/50" : "bg-muted text-muted-foreground border-primary/50"} absolute right-0 rounded-l-full top-8 px-2 py-1 text-sm font-medium border-y border-l w-max`}>
      {isEnded ? "Closed" : "Closing Soon"}
    </div>
  )
}