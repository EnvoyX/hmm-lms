import Image from "next/image";

import { about } from "~/app/(external)/content";

const logoMeanings = [
  {
    key: "p",
    title: "Pionir",
    image: "/external/images/logos/p.png",
    alt: "Makna huruf p pada logo",
    body: (
      <>
        Bentuk-bentuk ini menyusun <strong>huruf &ldquo;p&rdquo;</strong> yang
        merepresentasikan pionir (pioneer). Makna ini menegaskan semangat{" "}
        <strong>kepemimpinan, inovasi, dan keberanian bereksplorasi</strong>{" "}
        sebagai ciri utama seorang pionir.
      </>
    ),
  },
  {
    key: "b",
    title: "Berkarya",
    image: "/external/images/logos/b.png",
    alt: "Makna huruf b pada logo",
    body: (
      <>
        Komposisi serupa juga membentuk <strong>huruf &ldquo;b&rdquo;</strong>{" "}
        yang melambangkan berkarya (to create). Ini merefleksikan komitmen
        terhadap <strong>kreativitas, kontribusi, dan proses membangun</strong>{" "}
        sesuatu yang bermakna, bukan sekadar memimpin.
      </>
    ),
  },
  {
    key: "star",
    title: "Kompas Arah",
    image: "/external/images/logos/star.png",
    alt: "Makna bintang pada logo",
    body: (
      <>
        Di pusat logo terdapat <strong>bentuk bintang</strong> yang muncul dari
        ruang negatif tempat seluruh elemen bertemu. Bintang ini
        merepresentasikan <strong>arah, aspirasi, dan persatuan</strong>, serta
        menjadi kompas perjalanan pionir untuk menciptakan dampak bermakna.
      </>
    ),
  },
  {
    key: "pawns",
    title: "Gerak Kolektif",
    image: "/external/images/logos/pawns.png",
    alt: "Makna pion pada logo",
    body: (
      <>
        Delapan bentuk identik merefleksikan{" "}
        <strong>delapan pion dalam papan catur</strong>. Elemen ini melambangkan{" "}
        <strong>kolaborasi dan kemajuan kolektif</strong>, yaitu individu yang
        bergerak dalam tujuan bersama untuk memberi dampak bagi sesama.
      </>
    ),
  },
] as const;

export function ExternalLogoMeaningSection() {
  return (
    <section
      id="logo-meaning"
      className="hmm-about-logo-meaning scroll-mt-[4.5rem] py-14 sm:py-18"
    >
      <div className="mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-about-logo-meaning__hero">
          <h2 className="hmm-title text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.03] text-balance text-[color-mix(in_srgb,var(--color-hmm-cream)_95%,white)]">
            Makna di Balik Logo
          </h2>
          <p className="hmm-sans mt-4 max-w-3xl text-[0.98rem] leading-relaxed text-white/78">
            Simbol Kabinet {about.kabinetName} dirancang sebagai narasi visual:
            pionir, berkarya, arah yang jelas, dan gerak kolektif.
          </p>
        </div>

        <div className="mt-10 space-y-5 sm:mt-12 sm:space-y-6">
          {logoMeanings.map((item, idx) => (
            <article
              key={item.key}
              className={`hmm-about-logo-meaning__row ${idx % 2 === 1 ? "hmm-about-logo-meaning__row--offset" : ""}`}
            >
              <div className="hmm-about-logo-meaning__step" aria-hidden>
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="hmm-about-logo-meaning__glyph-wrap">
                <div className="hmm-about-logo-meaning__glyph">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={170}
                    height={170}
                    className="hmm-about-logo-meaning__glyph-image h-auto w-[clamp(5.25rem,15vw,9.25rem)] object-contain"
                  />
                </div>
                <div
                  className="hmm-about-logo-meaning__connector"
                  aria-hidden
                />
              </div>
              <div className="hmm-about-logo-meaning__copy">
                <p className="hmm-about-logo-meaning__panel-title">
                  {item.title}
                </p>
                <p className="hmm-sans mt-2 text-[0.98rem] leading-relaxed text-white/82">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
