-- AlterTable
ALTER TABLE "job_vacancies" ADD COLUMN IF NOT EXISTS "salaryLabel" TEXT;
ALTER TABLE "job_vacancies" ADD COLUMN IF NOT EXISTS "seniority" TEXT;
ALTER TABLE "job_vacancies" ADD COLUMN IF NOT EXISTS "employmentType" TEXT;
