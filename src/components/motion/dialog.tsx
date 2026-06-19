'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type React from 'react';
import { useState, type MouseEvent } from 'react';
import { cn } from '~/lib/utils';

export default function MotionImageDialog({ layoutId, dialogClassname, className, ...props }: { layoutId: string, dialogClassname?: string } & ImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div layoutId={layoutId} onClick={() => setIsOpen(true)} className='cursor-pointer h-full'>
        <Image className={className} {...props} alt='' />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-999 flex items-center justify-center bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              layoutId={layoutId}
              className={cn('w-full max-w-lg rounded overflow-hidden', dialogClassname)}
              onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <Image className='w-full object-contain' {...props} alt='' />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}