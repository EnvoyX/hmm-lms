import { cn } from '~/lib/utils';
import Link, { type LinkProps } from 'next/link';
import Image from 'next/image';
import { Star, Tally5, Users2 } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import type { CourseType } from '@prisma/client';
type CoursesItemProps = {
  id: string | number;
  title: string;
  type: CourseType;
  image: string;
  subject: string;
  numberOfMembers: number;
  numberOfTryouts: number;
  rating?: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
} & LinkProps;

export default function CoursesItem({
  id,
  title,
  type,
  image,
  subject,
  numberOfMembers,
  numberOfTryouts,
  orientation = 'vertical',
  rating,
  className,
}: CoursesItemProps) {

  return (
    <Link
      href={`/courses/${id}`}
      className={cn(
        'rounded-md shadow flex flex-col justify-end overflow-hidden cursor-pointer aspect-[4/5] md:aspect-[7/10] group lg:aspect-[8/10] bg-card transition-colors border',
        orientation === 'horizontal' && 'flex-row aspect-[16/9] lg:aspect-[16/10]',
        className
      )}
    >
      <Image
        src={image}
        alt='item'
        width={300}
        height={200}
        className={cn('object-cover aspect-16/9 transition-all', orientation === 'horizontal' && 'h-full w-2/5')}
      />
      <div className={cn('py-2 md:pt-4 px-2 md:px-4 relative transition-all overflow-hidden flex flex-col justify-between h-full', orientation === 'horizontal' && 'w-3/5 h-full')}>
        <div className='space-y-2'>
          <div className="flex gap-4 items-center justify-between">
            <h6 className='text-muted-foreground text-2xs md:text-xs'>{subject}</h6>
            {orientation === 'vertical' && (
              <>
                {type === "MANDATORY" ? (
                  <div className="rounded-md bg-primary px-2 py-0.5 text-[10px] text-white">Mandatory</div>
                ) : type === "MACHINING" ? (<div className="rounded-md bg-success px-2 py-0.5 text-[10px] text-white">Machining</div>) : (<div className="rounded-md bg-primary/50 px-2 py-0.5 text-[10px] text-white">Optional</div>)}
              </>
            )}
          </div>
          <h4 className={cn('text-xs md:text-sm font-medium text-ellipsis line-clamp-2 group-hover:text-primary transition-all', orientation === 'horizontal' && 'line-clamp-3')} title={title}>{title}</h4>
        </div>
        <div className='space-y-1'>
          <Separator />
          <div className='flex justify-end gap-3 items-center md:text-sm self-end text-xs *:flex *:items-center *:gap-1'>
            <div className="">
              <Users2 size={10} />
              <span>{numberOfMembers}</span>
            </div>
            <div className="">
              <Tally5 size={10} />
              <span>{numberOfTryouts}</span>
            </div>
            <div className="">
              <Star size={10} className='' />
              <span>{rating ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
