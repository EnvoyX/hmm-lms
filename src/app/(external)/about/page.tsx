import Image from "next/image";
import {
  about,
  externalImages,
  organogramItems,
} from "~/app/(external)/content";
import { publicFileExists } from "~/lib/external-asset";
import { ExternalMisiSection } from "../external-misi-section";
import { ExternalLogoMeaningSection } from "../external-logo-meaning-section";
import { ExternalOrganogramSection } from "../external-organogram-section";
import { HmmExternalNavbar } from "../hmm-external-navbar";
import { ExternalVisiSection } from "../external-visi-section";

function resolvePublic(src: string): string | null {
  const rel = src.startsWith("/") ? src.slice(1) : src;
  return publicFileExists(rel) ? src : null;
}

export default function ExternalAboutPage() {
  const heroImage = resolvePublic(externalImages.aboutHero);
  const visiImage = resolvePublic(externalImages.visiArt);
  const organogram = organogramItems
    .map((item) => ({
      ...item,
      imageUrl: resolvePublic(item.imageSrc),
    }))
    .filter(
      (item): item is { title: string; imageSrc: string; imageUrl: string } =>
        item.imageUrl !== null,
    );

  return (
    <>
      <HmmExternalNavbar />
      <main className="hmm-sans text-[var(--color-hmm-navy)]">
        <section
          id="about-hero"
          className="hmm-chapter-dark relative min-h-[82svh] scroll-mt-[4.5rem] overflow-hidden"
        >
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
          )}
          <div
            className="hmm-about-hero-overlay absolute inset-0"
            aria-hidden
          />
          <div
            className="hmm-about-hero-vignette absolute inset-0"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[82svh] w-full max-w-[86rem] flex-col justify-end px-4 pt-24 pb-14 sm:px-8 sm:pt-28 sm:pb-18">
            <div className="hmm-eyebrow-rule text-white/85">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_62%,var(--color-hmm-cream))]">
                About kabinet
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Image
                src="/external/images/logos/logo-putih.svg"
                alt="Logo Kabinet Pemimpin Berkarya"
                width={92}
                height={92}
                className="h-18 w-18 object-contain drop-shadow-lg sm:h-22 sm:w-22"
                priority
              />
              <div className="max-w-3xl">
                <h1 className="hmm-type-section text-balance text-white">
                  {about.heading}
                </h1>
                <p className="hmm-type-lede mt-3 max-w-[52ch] text-white/90">
                  {about.lead}
                </p>
                <p className="hmm-type-prose mt-3 max-w-[66ch] text-white/85">
                  {about.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ExternalLogoMeaningSection />
        <ExternalOrganogramSection items={organogram} />
        <section className="hmm-about-vision-bridge" aria-hidden />
        <section className="hmm-about-vision-intro hmm-chapter-dark">
          <div className="mx-auto max-w-[86rem] px-4 py-6 sm:px-8 sm:py-7">
            <p className="hmm-type-eyebrow text-white/70">Vision and Mission</p>
            <h2 className="hmm-type-section mt-2 text-white">
              Arah gerak Kabinet Pemimpin Berkarya
            </h2>
            <p className="hmm-type-prose mt-3 max-w-3xl text-white/82">
              Visi sebagai kompas utama, lalu diterjemahkan menjadi misi kerja
              yang bertahap dan terukur.
            </p>
          </div>
        </section>
        <ExternalVisiSection visiImage={visiImage} />
        <ExternalMisiSection />
      </main>
    </>
  );
}
