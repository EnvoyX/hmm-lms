/**
 * External landing copy and asset paths. Images live under /public/external/images/; add files to match.
 */

export const manifesto = {
  /** Three-beat punch line (IG-style) */
  punch: "Presisi. Karya. Dampak.",
  support:
    "Pionir di kelas, di himpunan, di Indonesia untuk keilmuan, masyarakat, dan bangsa.",
} as const;

export const about = {
  kabinetName: "Pionir Berkarya",
  /** First clause styled bold italic in the hero */
  headingPrefix: "HMM ITB: the Creation and Career Incubator,",
  headingSuffix: "shaping its members into Future Pioneers!",
  /** Short hero line below the title */
  lead: "Inkubator karya dan karier untuk membentuk pionir masa depan.",
} as const;

export const visi = {
  heading: "Visi HMM",
  lead: "Pionir masa depan lewat karya & keprofesian.",
  tldr: "Dua jalur: inkubator karya (keteknikmesinan) + inkubator keprofesian (karir & soft skill).",
} as const;

export const inkubatorKarya = {
  title: "Inkubator karya & keprofesian",
  karya: {
    subtitle: "Inkubator karya",
    lead: "Kajian, lomba, karya masyarakat, keilmuan yang hidup.",
    body: "HMM ITB menjadi wadah yang mengembangkan pemahaman dan keterampilan anggotanya dalam bidang ke-karya-an, yaitu karya keteknikmesinan (kajian isu, perlombaan, dan karya untuk masyarakat). Tujuannya: anggota lebih memahami keilmuannya sendiri dan menerapkannya di masyarakat dan masa depan.",
  },
  keprofesian: {
    subtitle: "Inkubator keprofesian",
    lead: "Karir terpersonalisasi, relevan, siap industri.",
    body: "HMM ITB menjadi wadah yang mengembangkan pemahaman dan keterampilan anggotanya dalam bidang karir, mencakup soft skill yang sesuai tujuan karir masing-masing secara terpersonalisasi, sehingga anggota memiliki kemampuan yang dibutuhkan dan dapat diterima di perusahaan yang diinginkan.",
  },
} as const;

export type EditorialPillar = "Study" | "Society" | "Solidarity";

export type EditorialSpot = {
  id: string;
  imageSrc: string;
  tag: EditorialPillar;
  caption: string;
  href?: string;
  /** Layout: one tile is `feature` (2×2 on large screens) */
  bento: "feature" | "default";
};

/** Foreground bento: mixed sizes; images as story tiles (paths under /public/) */
export const editorialSpots: ReadonlyArray<EditorialSpot> = [
  {
    id: "lab-momentum",
    imageSrc: "/external/images/juara_ui.jpg",
    tag: "Study",
    caption: "Fokus di lab, siap lomba nasional",
    bento: "feature",
  },
  {
    id: "kawan-dan-aksi",
    imageSrc: "/external/images/wanakarya.jpg",
    tag: "Society",
    caption: "Dampak nyata, bareng warga",
    bento: "default",
  },
  {
    id: "karya-desain",
    imageSrc: "/external/images/treser.jpg",
    tag: "Study",
    caption: "Dari sketsa ke produk",
    bento: "default",
  },
  {
    id: "jalin-luar",
    /* Campus / visit story; use kunjungan.jpg in public when available (see other editorial assets) */
    imageSrc: "/external/images/unilever.jpg",
    tag: "Society",
    caption: "Jejak kunjungan & kolaborasi",
    bento: "default",
  },
  {
    id: "satu-irama",
    imageSrc: "/external/images/welpar.jpg",
    tag: "Solidarity",
    caption: "Kekuatan satu badan, satu tujuan",
    bento: "default",
  },
] as const;

export type MisiItem = {
  cardTitle: string;
  oneLiner: string;
  summary: string;
  body: string;
};

export const misi: ReadonlyArray<MisiItem> = [
  {
    cardTitle: "Karya teknis",
    oneLiner: "Berkarya teknis, evaluatif, inovatif di bidangmu.",
    summary: "Wadah karya teknis, evaluatif, dan inovatif",
    body: "Membentuk wadah pengembangan kemampuan berkarya anggota secara teknis, evaluatif, dan inovatif di bidang keteknikmesinan.",
  },
  {
    cardTitle: "Pionir pribadi",
    oneLiner: "Berkembang personal; tidak satu cetakan.",
    summary: "Pionir dan personalisasi",
    body: "Mengembangkan anggota HMM ITB menjadi pionir dan sistem perkembangan diri anggota yang terpersonalisasi.",
  },
  {
    cardTitle: "Siap profesi",
    oneLiner: "Kompeten menghadapi industri yang bergerak.",
    summary: "Siap hadapi dunia profesional",
    body: "Mengembangkan kompetensi dan keterampilan anggota untuk siap menghadapi tantangan dunia keprofesian yang dinamis.",
  },
  {
    cardTitle: "Lingkungan sehat",
    oneLiner: "Kebutuhan dasar terpenuhi, tumbuh bareng.",
    summary: "Lingkungan suportif",
    body: "Memastikan pemenuhan kebutuhan dasar anggota di lingkungan yang suportif dalam mendukung perkembangan.",
  },
  {
    cardTitle: "Jaring & bangun",
    oneLiner: "Jembatan ke eksternal yang jelas dan saling harga.",
    summary: "Jembatan eksternal",
    body: "Membangun dan memelihara hubungan baik dengan pihak eksternal sebagai jembatan dalam kolaborasi dan pemenuhan kebutuhan himpunan.",
  },
  {
    cardTitle: "Empati dulu",
    oneLiner: "Karya bermanfaat dimulai dari memahami.",
    summary: "Empati menuju karya",
    body: "Mewadahi pembelajaran empati anggota sebagai langkah awal dalam implementasi karya yang bermanfaat dan tepat guna bagi masyarakat.",
  },
  {
    cardTitle: "Terpampang jelas",
    oneLiner: "Cerita HMM & anggota, terbuka di media.",
    summary: "Exposure organisasi & anggota",
    body: "Mengoptimalisasi penggunaan media sosial dalam upaya peningkatan exposure dari HMM ITB sebagai organisasi keteknikmesinan dan anggotanya.",
  },
  {
    cardTitle: "Tata luhur",
    oneLiner: "Organisasi transparan, terkendali, mandiri.",
    summary: "Organisasi transparan & terkontrol",
    body: "Membangun sistem organisasi yang optimal, transparan, independen, dan terkontrol.",
  },
] as const;

export type OrganogramItem = {
  title: string;
  imageSrc: string;
};

export {
  organogramDetailsByTitle,
  type OrganogramModalDetail,
} from "./organogram-details";

export const organogramItems: ReadonlyArray<OrganogramItem> = [
  { title: "DPA", imageSrc: "/external/images/organogram/DPA.jpg" },
  { title: "Prince", imageSrc: "/external/images/organogram/Prince.jpg" },
  { title: "RCKT", imageSrc: "/external/images/organogram/RCKT.jpg" },
  { title: "SENATOR", imageSrc: "/external/images/organogram/SENATOR.jpg" },
  {
    title: "Bureau of Human Capital",
    imageSrc: "/external/images/organogram/Bureau of Human Capital.jpg",
  },
  {
    title: "Bureau of Creative Communication and Information",
    imageSrc:
      "/external/images/organogram/Bureau of Creative Communication and Information.jpg",
  },
  {
    title: "General Secretariat",
    imageSrc: "/external/images/organogram/General Secretariat.jpg",
  },
  {
    title: "Department of Knowledge and Creation",
    imageSrc:
      "/external/images/organogram/Department of Knowledge and Creation.jpg",
  },
  {
    title: "Department of Career Development",
    imageSrc:
      "/external/images/organogram/Department of Career Development.jpg",
  },
  {
    title: "Department of Student Welfare",
    imageSrc: "/external/images/organogram/Department of Student Welfare.jpg",
  },
  {
    title: "Department of Public Relations",
    imageSrc: "/external/images/organogram/Department of Public Relations.jpg",
  },
  {
    title: "Department of Social Service",
    imageSrc: "/external/images/organogram/Department of Social Service.jpg",
  },
  {
    title: "Sub-Bureau of Member Development",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Member Development.jpg",
  },
  {
    title: "Sub-Bureau of Member Empowerment & Personalization",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Member Empowerment & Personalization.jpg",
  },
  {
    title: "Sub-Bureau of Human Resource Management",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Human Resource Management.jpg",
  },
  {
    title: "Sub-Bureau of Creative Marketing & Strategy",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Creative Marketing & Strategy.jpg",
  },
  {
    title: "Sub-Bureau of Photography and Videography",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Photography and Videography.jpg",
  },
  {
    title: "Sub-Bureau of Website Development",
    imageSrc:
      "/external/images/organogram/Sub-Bureau of Website Development.jpg",
  },
  { title: "Secretary", imageSrc: "/external/images/organogram/Secretary.jpg" },
  { title: "Treasurer", imageSrc: "/external/images/organogram/Treasurer.jpg" },
  {
    title: "M-Trepreneur",
    imageSrc: "/external/images/organogram/M-Trepreneur.jpg",
  },
  {
    title: "Engineering Product Development",
    imageSrc: "/external/images/organogram/Engineering Product Development.jpg",
  },
  {
    title: "Division of Research and Learning",
    imageSrc:
      "/external/images/organogram/Division of Research and Learning.jpg",
  },
  {
    title: "Division of Competition Incubation",
    imageSrc:
      "/external/images/organogram/Division of Competition Incubation.jpg",
  },
  {
    title: "Division of Career Information",
    imageSrc: "/external/images/organogram/Division of Career Information.jpg",
  },
  {
    title: "Division of Career Preparation",
    imageSrc: "/external/images/organogram/Division of Career Preparation.jpg",
  },
  {
    title: "Division of Community and Well-being",
    imageSrc:
      "/external/images/organogram/Division of Community and Well-being.jpg",
  },
  {
    title: "Division of Appreciation",
    imageSrc: "/external/images/organogram/Division of Appreciation.jpg",
  },
  {
    title: "Division of Extracurricular",
    imageSrc: "/external/images/organogram/Division of Extracurricular.jpg",
  },
  {
    title: "Academics and Scholarship",
    imageSrc: "/external/images/organogram/Academics and Scholarship.jpg",
  },
  {
    title: "Division of Intracampus Relations",
    imageSrc:
      "/external/images/organogram/Division of Intracampus Relations.jpg",
  },
  {
    title: "Extracampus Relations",
    imageSrc: "/external/images/organogram/Extracampus Relations.jpg",
  },
  {
    title: "Division of Alumni Relations",
    imageSrc: "/external/images/organogram/Division of Alumni Relations.jpg",
  },
  {
    title: "Division of Community Service",
    imageSrc: "/external/images/organogram/Division of Community Service.jpg",
  },
  {
    title: "Division of Community Development",
    imageSrc:
      "/external/images/organogram/Division of Community Development.jpg",
  },
] as const;

export const heritageTimeline = [
  {
    year: "1946",
    title: "Establishment",
    text: "HMM ITB didirikan pada Desember 1946 sebagai wadah mahasiswa mesin untuk berdaya dan berkarya bagi bangsa.",
  },
  {
    year: "Now",
    title: about.kabinetName,
    text: "HMM ITB terus mengembangkan pendidikan kemahasiswaan, advokasi anggota, dan pengabdian masyarakat yang berdampak.",
  },
] as const;

export const externalImages = {
  /** Full-bleed manifesto / hero */
  hero: "/external/images/hero.png",
  /** Study pillar: split layout (academics / keilmuan) */
  pillarStudy: "/external/images/ilmu_karya.jpg",
  /** Society pillar: full-bleed, left weight */
  pillarSociety: "/external/images/salam_satu_bakul.jpg",
  /** Solidarity pillar */
  pillarSolidarity: "/external/images/ngarak.jpg",
  /** Intentional light “studio” chapter */
  heritage: "/external/images/about-hero.png",
  /** About hero wallpaper */
  aboutHero: "/external/images/about-hero.png",
  /** Visi / inkubator dark chapter (optional) */
  visiArt: "/external/images/badan_pengurus.jpg",
  /** CTA */
  cta: "/external/images/wisok.jpg",
} as const;

export const externalContact = {
  email: "bccipionirberkarya@gmail.com",
  /** Official socials; update if handles change */
  instagramUrl: "https://www.instagram.com/hmm_itb/" as string,
  tiktokUrl: "https://www.tiktok.com/@hmm.itb" as string,
  lineUrl: "" as string,
} as const;

export const pillars = [
  {
    key: "study" as const,
    title: "Study",
    kicker: "Keilmuan & karya",
    description:
      "Mendorong tujuan pendidikan lewat karya, ide, dan inovasi teknologi yang relevan.",
    variant: "split" as const,
    imageKey: "pillarStudy" as const,
  },
  {
    key: "society" as const,
    title: "Society",
    kicker: "Masyarakat",
    description:
      "Tanggung jawab sosial dan kontribusi nyata bagi masyarakat dan kemajuan Indonesia.",
    variant: "society" as const,
    imageKey: "pillarSociety" as const,
  },
  {
    key: "solidarity" as const,
    title: "Solidarity",
    kicker: "Kekeluargaan",
    description:
      "Kekeluargaan, keharmonisan, dan kesejahteraan anggota. Satu solidaritas.",
    variant: "solidarity" as const,
    imageKey: "pillarSolidarity" as const,
  },
] as const;
