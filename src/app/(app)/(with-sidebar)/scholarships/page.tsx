"use client";

import { api } from '~/trpc/react';
import { useSearchParams } from 'next/navigation';
import ScholarshipCard from './scholarship-card';

export default function ScholarshipPage() {
  const [allData] = api.scholarship.getAll.useSuspenseQuery();
  const params = useSearchParams();
  const id = params.get("id");

  const dataToDisplay = id ? allData.filter(item => item.id === id) : allData;
  // const now = new Date();

  // const availableScholarships = dataToDisplay.filter(s => s.deadline >= now);
  // const pastDueScholarships = dataToDisplay.filter(s => s.deadline < now);

  return (
    <div className='mx-auto max-w-5xl space-y-3'>
      {/* {selectedSc && (
        <ScholarshipDialog scholarship={selectedSc} />
      )} */}
      {dataToDisplay.length === 0 && (
        <section className="rounded-xl border border-dashed py-10 text-center text-muted-foreground">
          No scholarships found.
        </section>
      )}
      {dataToDisplay.map(({ createdBy: _, createdById: _1, createdAt: _2, updatedAt: _3, ...scholarship }) => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
      ))}
    </div>
  );
}