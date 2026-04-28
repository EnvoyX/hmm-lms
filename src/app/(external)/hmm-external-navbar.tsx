"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const EXTERNAL_PAGES: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "About" },
];

function computeScrollProgress(): number {
  const h = document.documentElement;
  const maxScroll = h.scrollHeight - h.clientHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(100, Math.max(0, (h.scrollTop / maxScroll) * 100));
}

export function HmmExternalNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setScrollProgress(computeScrollProgress());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className="hmm-nav-sticky relative pt-[env(safe-area-inset-top,0px)]"
      data-hmm-scrolled={scrolled ? "true" : "false"}
    >
      <div className="hmm-scroll-progress-track" aria-hidden>
        <div
          className="hmm-scroll-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="hmm-nav-inner">
        <Link
          href="/"
          className="group flex min-h-11 min-w-11 shrink-0 items-center gap-2 sm:min-h-0 sm:gap-3"
        >
          <Image
            src="/external/images/logos/logo-hmm.png"
            alt="HMM ITB"
            width={40}
            height={40}
            className="h-8 w-8 object-contain drop-shadow-md sm:h-9 sm:w-9"
            priority
          />
          <div className="hidden flex-col sm:flex">
            <span className="hmm-title text-sm font-bold tracking-wide text-white drop-shadow">
              HMM ITB
            </span>
            <span className="hmm-sans text-[0.6rem] font-medium tracking-[0.2em] text-white/80">
              HIMPUNAN MAHASISWA MESIN ITB
            </span>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end md:flex">
          <nav
            className="hmm-sans hmm-nav-desktop hmm-nav-desktop--centered"
            aria-label="External pages"
          >
            <ul className="flex items-center gap-1">
              {EXTERNAL_PAGES.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "hmm-nav-desktop-link block px-3 py-2 text-xs font-semibold tracking-[0.12em] transition",
                        "focus-visible:ring-2 focus-visible:ring-[var(--color-hmm-yellow)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--color-hmm-navy-deep)_90%,black)] focus-visible:outline-none",
                        isActive && "hmm-nav-link--active",
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link href="/auth/sign-in" className="hmm-nav-signin">
            Sign In
          </Link>
        </div>

        <button
          type="button"
          className="hmm-nav-mobile-toggle md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="hmm-mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          data-hmm-open={mobileOpen ? "true" : "false"}
        >
          <span className="hmm-nav-mobile-icon" aria-hidden="true">
            <span className="hmm-nav-mobile-icon__line" />
            <span className="hmm-nav-mobile-icon__line" />
            <span className="hmm-nav-mobile-icon__line" />
          </span>
        </button>
      </div>

      <div
        id="hmm-mobile-nav"
        className={cn(
          "hmm-nav-mobile md:hidden",
          mobileOpen ? "hmm-nav-mobile--open" : "hmm-nav-mobile--closed",
        )}
      >
        <nav className="hmm-sans" aria-label="External mobile pages">
          <ul className="grid grid-cols-2 gap-2">
            {EXTERNAL_PAGES.map((page) => {
              const isActive = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "hmm-nav-mobile-link block px-2 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-white/90",
                      isActive && "hmm-nav-link--active",
                    )}
                  >
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/auth/sign-in"
          onClick={() => setMobileOpen(false)}
          className="hmm-nav-signin mt-3 inline-flex w-full justify-center"
        >
          Sign In to LMS
        </Link>
      </div>
    </header>
  );
}
