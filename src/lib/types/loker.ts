export interface JobVacancy {
  id: string;
  title: string;
  company: string;
  position: string;
  eligibility: string;
  streams: string[];
  overview: string;
  timeline: string;
  applyLink: string;
  salaryLabel: string | null;
  seniority: string | null;
  employmentType: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy: {
    name: string;
  };
}

export interface JobVacancyWithCreator extends JobVacancy {
  createdBy: {
    name: string;
  };
}
