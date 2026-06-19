import { RiInstagramLine, RiTiktokLine } from "@remixicon/react";
import { externalContact } from "./content";

const year = new Date().getFullYear();

export function ExternalLandingFooter() {
  return (
    <footer className="hmm-chapter-dark border-t border-white/10 bg-[var(--color-hmm-navy-deep)] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:px-8">
      <div className="mx-auto flex max-w-[86rem] flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
        <p className="hmm-sans text-center text-xs text-white/45 sm:text-left">
          © {year} Himpunan Mahasiswa Mesin ITB
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-end">
          <a
            href={externalContact.instagramUrl}
            className="hmm-sans inline-flex min-h-10 items-center gap-2 text-xs font-semibold tracking-[0.1em] text-white/80 transition hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiInstagramLine className="h-5 w-5 shrink-0" aria-hidden />
            Instagram
          </a>
          <a
            href={externalContact.tiktokUrl}
            className="hmm-sans inline-flex min-h-10 items-center gap-2 text-xs font-semibold tracking-[0.1em] text-white/80 transition hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTiktokLine className="h-5 w-5 shrink-0" aria-hidden />
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}
