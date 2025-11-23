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
    <div className='max-w-5xl mx-auto space-y-4'>
      {/* {selectedSc && (
        <ScholarshipDialog scholarship={selectedSc} />
      )} */}
      {dataToDisplay.map(({ createdBy: _, createdById: _1, createdAt: _2, updatedAt: _3, ...scholarship }) => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
      ))}
    </div>
  );
}