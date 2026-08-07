import Link from "next/link";
import { externalContact } from "./content";

const mailtoHref = `mailto:${externalContact.email}`;

export function ExternalSolidarityCta() {
  const showLine = externalContact.lineUrl.length > 0;

  return (
    <div className="mt-8 flex w-full max-w-3xl flex-col gap-4 sm:mt-10 sm:gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <a
          href="#pillars"
          className="hmm-btn-cta hmm-btn-cta--primary min-h-11 w-full sm:min-h-0 sm:w-auto"
        >
          Lihat karya mahasiswa
        </a>
        <Link
          href="/events"
          className="hmm-btn-cta hmm-btn-cta--secondary min-h-11 w-full sm:min-h-0 sm:w-auto"
        >
          Eksplor kegiatan
        </Link>
        <a
          href={mailtoHref}
          className="hmm-btn-cta hmm-btn-cta--secondary min-h-11 w-full sm:min-h-0 sm:w-auto"
        >
          Hubungi kami
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {showLine && (
          <a
            href={externalContact.lineUrl}
            className="hmm-sans text-xs font-semibold tracking-[0.12em] text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Line
          </a>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
        <a
          href="#visi"
          className="hmm-sans text-sm font-semibold text-white/80 underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Visi &amp; arah
        </a>
        <a
          href="#editorial"
          className="hmm-sans text-sm font-semibold text-white/80 underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Spotlight
        </a>
      </div>
    </div>
  );
}
