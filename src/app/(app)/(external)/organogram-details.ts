/**
 * Modal body content for organogram cards. Keys must match `title` in `organogramItems`.
 */

export type OrganogramFeaturedDetail = {
  kind: "featured";
  tagline: string;
  paragraphs: string[];
  people: { role: string; name: string }[];
};

export type OrganogramRosterDetail = {
  kind: "roster";
  rows: { role: string; name: string }[];
};

export type OrganogramModalDetail =
  | OrganogramFeaturedDetail
  | OrganogramRosterDetail;

export const organogramDetailsByTitle: Record<string, OrganogramModalDetail> = {
  Prince: {
    kind: "featured",
    tagline:
      "HMM ITB: the Creation and Career Incubator, shaping its members into Future Pioneers!",
    people: [
      {
        role: "Prince HMM ITB BP Pionir Berkarya",
        name: "Hilman Aufazaka Alhakim",
      },
    ],
    paragraphs: [
      "Awalnya, saya memimpikan **HMM ITB** sebagai platform yang relevan bagi seluruh anggotanya. Untuk mencapai hal tersebut, saya membawa tiga ide utama: membentuk anggota menjadi **pioneers** dalam lingkungan yang suportif, membantu mereka membangun portofolio dalam **mechanical engineering creations**, dan memberikan **personalized competencies** berdasarkan **career goals** mereka. Ketiga ide tersebut kemudian diubah menjadi visi dan misi saya, mengarahkan **HMM ITB** menjadi **Future Pioneer's Incubator**. Oleh karena itu… **Pionir Berkarya**.",
    ],
  },

  "General Secretariat": {
    kind: "featured",
    tagline: "Guiding in silence, shaping in structure",
    people: [
      { role: "General Secretary", name: "Mikael Amadeus Tristanarendra" },
    ],
    paragraphs: [
      'Meskipun **General Secretariat** (GS) beroperasi di balik layar, kami adalah tulang punggung organisasi ini. Setiap alur yang memastikan kelancaran operasional berjalan melalui biro kami. GS adalah lebih dari sekadar "**General Secretariat**", kami adalah **Ground Support**. Kami berfungsi sebagai fondasi kokoh yang memungkinkan orang lain untuk tumbuh, berkembang, dan memenuhi tujuan sejati mereka, menyatu sebagai satu organisasi yang utuh dan lengkap.',
    ],
  },

  Secretary: {
    kind: "featured",
    tagline: "Coordination that keeps the cabinet aligned",
    people: [
      { role: "Secretary 1", name: "Lintang Nugrahaning" },
      { role: "Secretary 2", name: "Ivan Prayata" },
    ],
    paragraphs: [
      "Secretariat mendukung kesinambungan kerja pimpinan dan memastikan komunikasi serta dokumentasi organisasi berjalan konsisten dengan arahan kabinet.",
    ],
  },

  Treasurer: {
    kind: "featured",
    tagline: "Stewardship of organizational resources",
    people: [
      { role: "Treasurer 1", name: "Bima Bhadrikananda" },
      { role: "Treasurer 2", name: "Raudhah Yahya Kuddah" },
    ],
    paragraphs: [
      "Tim Treasury bertanggung jawab atas pengelolaan keuangan organisasi secara transparan, akuntabel, dan selaras dengan kebutuhan program kabinet.",
    ],
  },

  "Bureau of Creative Communication and Information": {
    kind: "featured",
    tagline: "Everyone can be creative",
    people: [{ role: "Head of Bureau", name: "Marvel Putra Purnawan" }],
    paragraphs: [
      "**Bureau of Creative Communication and Information** (BCCI) didasarkan pada keyakinan bahwa setiap orang bisa menjadi kreatif. Ini adalah wadah bagi anggota **HMM ITB** untuk mengeksplorasi ide, berkolaborasi, dan mengekspresikan diri mereka melalui kreasi yang bermakna. Kreativitas di sini tumbuh dari rasa ingin tahu dan pengalaman bersama, bukan sekadar keahlian. Melalui upaya kolektif, kami bertujuan untuk menciptakan karya yang berdampak, bertahan lama, dan bernilai bagi orang lain.",
    ],
  },

  "Bureau of Human Capital": {
    kind: "featured",
    tagline: "Igniting minds",
    people: [{ role: "Head of Bureau", name: "Abdullah Muhammad Faiz" }],
    paragraphs: [
      "**Bureau of Human Capital** (BHC) adalah pihak pertama dan utama dalam sistem pendidikan **HMM ITB**. Kami menginisiasi, memfasilitasi, dan mengendalikan proses pembelajaran setiap individu dengan harapan dapat mencapai kesuksesan yang telah mereka tentukan sebelumnya. Biro kami berusaha memberikan dampak positif pada **HMM ITB**, dan dunia, melalui upaya kami dalam mengembangkan setiap anggota menjadi versi terbaik dari diri mereka.",
    ],
  },

  "Department of Career Development": {
    kind: "featured",
    tagline: "Blueprint to your career",
    people: [{ role: "Head of Department", name: "Riza Azzam Burhani" }],
    paragraphs: [
      "**Department of Career Development** (DCD) dibangun di atas keyakinan bahwa anggota **HMM ITB** memiliki potensi untuk menjadi pionir masa depan. Kami adalah wadah bagi anggota untuk bersiap menghadapi **careers** mereka dengan membantu mereka menentukan **career goals**, menyediakan **bridge** menuju dunia **professional** melalui paparan langsung kepada **industry experts**, dan memberdayakan mereka dengan keterampilan serta kepercayaan diri untuk menaklukkan setiap tahap **recruitment process**.",
    ],
  },

  "Department of Knowledge and Creation": {
    kind: "featured",
    tagline: "Where creators are made",
    people: [{ role: "Head of Department", name: "Abdul Azis Sulaiman" }],
    paragraphs: [
      "**Department of Knowledge and Creation** (DKC) adalah pusat inovasi kami. Kami membimbing anggota dalam perjalanan lengkap yang menumbuhkan wawasan akademik mendalam melalui **research**, mengubah ide-ide tersebut menjadi prototipe dunia nyata dalam **product development**, dan membuktikan keterampilan tersebut di panggung dunia melalui **intensive competition incubation**.",
    ],
  },

  "Department of Public Relations": {
    kind: "featured",
    tagline: "Weaving trust in collaborative harmony",
    people: [{ role: "Head of Department", name: "Imam Ar Rayyan" }],
    paragraphs: [
      "Di **Department of Public Relations** (DPR), kami percaya bahwa hubungan yang bermakna adalah fondasi dari dampak yang langgeng. Kami melayani sebagai **bridge** bagi **HMM ITB** untuk terlibat secara proaktif, berkomunikasi secara terbuka, dan membentuk kemitraan yang menguntungkan semua pihak. Kolaborasi di sini tumbuh dari kepercayaan, transparansi, dan tujuan bersama. Melalui ikatan ini, kami bertujuan untuk memperkuat **presence HMM ITB**, memperkokoh pengaruhnya, dan menciptakan nilai bagi komunitas yang kami layani.",
    ],
  },

  "Department of Social Service": {
    kind: "featured",
    tagline: "Balanced growth, founded on empathy",
    people: [{ role: "Head of Department", name: "Muhammad Dhia Fauzan" }],
    paragraphs: [
      "**Department of Social Service** (DSS) adalah tempat kita melakukan perjalanan bersama untuk menjadi manusia seutuhnya yang berlandaskan empati. Kami bertindak sebagai kekuatan penyeimbang sepanjang perjalanan hidup **HMM ITB**. Ini adalah tentang memupuk harmoni kasih sayang, diselimuti oleh kebaikan yang menginspirasi, dan membentuk individu yang lebih baik, satu langkah ke depan.",
    ],
  },

  "Department of Student Welfare": {
    kind: "featured",
    tagline: "Where needs are met, and happiness begins to flourish",
    people: [{ role: "Head of Department", name: "Fitra Faza Maula" }],
    paragraphs: [
      "Dalam kehidupan **HMM ITB** yang serba cepat, **Department of Student Welfare** (DSW) hadir untuk memastikan setiap anggota ingat untuk sesekali berhenti dan melihat sekeliling. Dengan memenuhi kebutuhan dasar anggota kami, kami meletakkan fondasi untuk kehidupan yang seimbang, bermakna, dan benar-benar bahagia.",
    ],
  },

  "Sub-Bureau of Member Development": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Member Development",
        name: "Muhammad Rizal Ibrahim",
      },
      {
        role: "Vice Head of Sub-bureau of Member Development",
        name: "Abdiel Faiz Daffa Putra",
      },
    ],
  },

  "Sub-Bureau of Member Empowerment & Personalization": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Member Empowerment and Personalization",
        name: "Josh Felix Rajagukguk",
      },
      {
        role: "Vice Head of Sub-bureau of Member Empowerment and Personalization",
        name: "Fahrezy Risky Ahmady",
      },
    ],
  },

  "Sub-Bureau of Human Resource Management": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Human Resource Management",
        name: "Haidar Raif Achyar",
      },
      {
        role: "Vice Head of Sub-bureau of Human Resource Management",
        name: "Edwina Tanisha Kristanty",
      },
    ],
  },

  "Sub-Bureau of Creative Marketing & Strategy": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Creative Marketing and Strategy",
        name: "Rasendriya Michelle",
      },
      {
        role: "Vice Head of Sub-bureau of Creative Marketing and Strategy",
        name: "Fauziah Fitri",
      },
    ],
  },

  "Sub-Bureau of Photography and Videography": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Photography and Videography",
        name: "Mahatma Raditya Baswara",
      },
      {
        role: "Vice Head of Sub-bureau of Photography and Videography",
        name: "Muhammad Luthfan Ahsani",
      },
      {
        role: "Vice Head of Sub-bureau of Photography and Videography",
        name: "Fawwaz Athar Suandhito",
      },
    ],
  },

  "Sub-Bureau of Website Development": {
    kind: "roster",
    rows: [
      {
        role: "Head of Sub-bureau of Information and Technology Development",
        name: "Adi Haditya Nursyam",
      },
      {
        role: "Vice Head of Sub-bureau of Information and Technology Development",
        name: "Jujur Satria Yudhatama",
      },
    ],
  },

  "M-Trepreneur": {
    kind: "roster",
    rows: [
      { role: "Head of Sub-bureau of M-Trepreneur", name: "Muhammad Wafizia" },
      {
        role: "Vice Head of Sub-bureau of M-Trepreneur",
        name: "Muhammad Bintang Iftitah",
      },
    ],
  },

  "Division of Career Information": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Career Information",
        name: "Raqa Duratul Akbar",
      },
      {
        role: "Vice Head of Division of Career Information",
        name: "Shalahuddin",
      },
      {
        role: "Vice Head of Division of Career Information",
        name: "Kelvin Keldiamana Keliat",
      },
    ],
  },

  "Division of Career Preparation": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Career Preparation",
        name: "Muhammad Noval Tores",
      },
      {
        role: "Vice Head of Division of Career Preparation",
        name: "Farraz Alif Hernando",
      },
    ],
  },

  "Division of Research and Learning": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Research and Learning",
        name: "Sandrina Agatha Sinaga",
      },
      {
        role: "Vice Head of Division of Research and Learning",
        name: "Rafael Albert Renato",
      },
    ],
  },

  "Division of Competition Incubation": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Competition Incubation",
        name: "Muhammad Zaiq Azmi",
      },
      {
        role: "Vice Head of Division of Competition Incubation",
        name: "Gravin Hotasi Zakharia",
      },
    ],
  },

  "Engineering Product Development": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Engineering Product Development",
        name: "Muhamad Novian Akbar",
      },
      {
        role: "Vice Head of Division of Engineering Product Development",
        name: "Juan Aaron Norata",
      },
      {
        role: "Vice Head of Division of Engineering Product Development",
        name: "Marvin Pradipta",
      },
    ],
  },

  "Academics and Scholarship": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Academics and Scholarship",
        name: "Agusto Theodorus",
      },
      {
        role: "Vice Head of Division of Academics and Scholarship",
        name: "Fikri Zidandaru",
      },
      {
        role: "Vice Head of Division of Academics and Scholarship",
        name: "Aryo Satya Wirawan",
      },
    ],
  },

  "Division of Alumni Relations": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Alumni Relations",
        name: "Rayyan Ghiffary Nusaly",
      },
      {
        role: "Vice Head of Division of Alumni Relations",
        name: "Joy Russell",
      },
      {
        role: "Vice Head of Division of Alumni Relations",
        name: "Arta Aulia Affif",
      },
    ],
  },

  "Division of Intracampus Relations": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Intracampus Relations",
        name: "Azka Prama",
      },
      {
        role: "Vice Head of Division of Intracampus Relations",
        name: "Zalfa Dhia Lesmawan",
      },
    ],
  },

  "Extracampus Relations": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Extracampus Relations",
        name: "Jeremy Fernando Silaban",
      },
      {
        role: "Vice Head of Division of Extracampus Relations",
        name: "Astrella Sakanti Dewandaru",
      },
    ],
  },

  "Division of Community Service": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Community Service",
        name: "Danisworo Pradiptandaru",
      },
      {
        role: "Vice Head of Division of Community Service",
        name: "Nabila Syifa Wardhani",
      },
    ],
  },

  "Division of Community Development": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Community Development",
        name: "Nabiel Falih Utama",
      },
      {
        role: "Vice Head of Division of Community Development",
        name: "Daffa Azzaini",
      },
      {
        role: "Vice Head of Division of Community Development",
        name: "Ancella Gusti Ayu",
      },
    ],
  },

  "Division of Appreciation": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Appreciation",
        name: "Naufal Radithya Dwinugraha",
      },
      {
        role: "Vice Head of Division of Appreciation",
        name: "Faryl Rashne Aydin",
      },
    ],
  },

  "Division of Community and Well-being": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Community and Well-being",
        name: "Juan Adidarma Subagia",
      },
      {
        role: "Vice Head of Division of Community and Well-being",
        name: "Inggar Pratiwi",
      },
      {
        role: "Vice Head of Division of Community and Well-being",
        name: "Jasmine Nurul",
      },
    ],
  },

  "Division of Extracurricular": {
    kind: "roster",
    rows: [
      {
        role: "Head of Division of Extracurricular",
        name: "Rakha Abdillah",
      },
      {
        role: "Vice Head of Division of Extracurricular",
        name: "Rizky Bagaskara",
      },
      {
        role: "Vice Head of Division of Extracurricular",
        name: "Irlo Eldriansha",
      },
    ],
  },
};
