import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { DEFAULT_SITE_SETTINGS } from "../src/lib/site-settings";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

function j(value: unknown) {
  return JSON.stringify(value);
}

async function main() {
  console.log("Seeding...");

  const passwordHash = hashSync(DEMO_PASSWORD, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "dara@jcipp.org" },
    update: { name: "ENG Hakseng" },
    create: {
      email: "dara@jcipp.org",
      name: "ENG Hakseng",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });

  const boardAdmin = await prisma.user.upsert({
    where: { email: "sopheak@jcipp.org" },
    update: {},
    create: {
      email: "sopheak@jcipp.org",
      name: "Chan Sopheak",
      role: "BOARD_ADMIN",
      passwordHash,
    },
  });

  const eventOrganizer = await prisma.user.upsert({
    where: { email: "lina@jcipp.org" },
    update: {},
    create: {
      email: "lina@jcipp.org",
      name: "Vuth Lina",
      role: "EVENT_ORGANIZER",
      passwordHash,
    },
  });

  // The real JCI Phnom Penh executive structure — one seat each, in rank
  // order. Only the president is tied to a real login (superAdmin); the
  // rest are placeholders until named members are assigned via the admin
  // Board Roster screen.
  const boardMembers = [
    {
      id: "seed-board-local-president",
      userId: superAdmin.id,
      name: superAdmin.name,
      title: j({ en: "Local President", km: "ប្រធានមូលដ្ឋាន" }),
      committee: null,
      sortOrder: 0,
    },
    {
      id: "seed-board-immediate-past-president",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Immediate Past President", km: "អតីតប្រធានភ្លាមៗ" }),
      committee: null,
      sortOrder: 1,
    },
    {
      id: "seed-board-secretary-general",
      userId: boardAdmin.id,
      name: boardAdmin.name,
      title: j({ en: "Local Secretary General", km: "អគ្គលេខាធិការមូលដ្ឋាន" }),
      committee: null,
      sortOrder: 2,
    },
    {
      id: "seed-board-legal-council",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "General Legal Council", km: "ទីប្រឹក្សាផ្នែកច្បាប់ទូទៅ" }),
      committee: null,
      sortOrder: 3,
    },
    {
      id: "seed-board-treasurer",
      userId: eventOrganizer.id,
      name: eventOrganizer.name,
      title: j({ en: "Local Treasurer", km: "រតនាធិការមូលដ្ឋាន" }),
      committee: null,
      sortOrder: 4,
    },
    {
      id: "seed-board-executive-vp",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Executive Vice President", km: "អនុប្រធានប្រតិបត្តិ" }),
      committee: null,
      sortOrder: 5,
    },
    {
      id: "seed-board-secretary-officer",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Secretary Officer", km: "មន្ត្រីលេខាធិការ" }),
      committee: null,
      sortOrder: 6,
    },
    {
      id: "seed-board-special-assistant",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Special Assistant", km: "ជំនួយការពិសេស" }),
      committee: null,
      sortOrder: 7,
    },
    {
      id: "seed-board-local-vp",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Local Vice President", km: "អនុប្រធានមូលដ្ឋាន" }),
      committee: null,
      sortOrder: 8,
    },
    {
      id: "seed-board-local-director",
      userId: null,
      name: "To Be Announced",
      title: j({ en: "Local Director", km: "នាយកមូលដ្ឋាន" }),
      committee: null,
      sortOrder: 9,
    },
  ];

  // Drop any board members from a previous seed run that aren't part of the
  // current structure, so re-seeding always reflects exactly these 10 seats.
  await prisma.boardMember.deleteMany({
    where: { id: { notIn: boardMembers.map((m) => m.id) } },
  });

  for (const member of boardMembers) {
    const { id, ...data } = member;
    await prisma.boardMember.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  // General membership directory (distinct from the executive boardMembers
  // above) — spans the chapter's full history since the 2010 founding so
  // /members has real data to search and filter by join year.
  const members = [
    {
      slug: "sok-dara",
      name: "Sok Dara",
      businessName: "Dara & Co. Accounting",
      jobTitle: j({ en: "Founding Partner", km: "ដៃគូស្ថាបនិក" }),
      industry: "Accounting",
      bio: j({
        en: "One of JCI Phnom Penh's founding members in 2010, Dara leads an accounting practice serving SMEs across the capital.",
        km: "ជាសមាជិកស្ថាបនិកម្នាក់របស់ JCI ភ្នំពេញក្នុងឆ្នាំ ២០១០ ដារ៉ាដឹកនាំក្រុមហ៊ុនគណនេយ្យសម្រាប់សហគ្រាសខ្នាតតូច និងមធ្យមនៅទូទាំងរាជធានី។",
      }),
      email: "dara@example.com",
      phone: "012 345 678",
      socialUrl: null,
      joinYear: 2010,
    },
    {
      slug: "keo-monyroth",
      name: "Keo Monyroth",
      businessName: "Monyroth Trading",
      jobTitle: j({ en: "Managing Director", km: "នាយកគ្រប់គ្រង" }),
      industry: "Trade & Import",
      bio: j({
        en: "Monyroth runs an import-export trading house and has mentored over a dozen young entrepreneurs through JCI's business bootcamps.",
        km: "មុនីរ័ត្ន ដឹកនាំក្រុមហ៊ុនជួញដូរនាំចូល-នាំចេញ និងបានណែនាំសហគ្រិនវ័យក្មេងជាង ១២ នាក់តាមរយៈកម្មវិធីបណ្តុះបណ្តាលអាជីវកម្មរបស់ JCI។",
      }),
      email: "monyroth@example.com",
      phone: null,
      socialUrl: null,
      joinYear: 2014,
    },
    {
      slug: "pich-monineath",
      name: "Pich Monineath",
      businessName: "Monineath Design Studio",
      jobTitle: j({ en: "Founder & Creative Director", km: "ស្ថាបនិក និងនាយកច្នៃប្រឌិត" }),
      industry: "Design",
      bio: j({
        en: "Monineath's branding studio works with local nonprofits and startups, and she chairs JCI Phnom Penh's annual gala design committee.",
        km: "ស្ទូឌីយោម៉ាកយីហោរបស់ម៉ូនីនាថ សហការជាមួយអង្គការមិនស្វែងរកប្រាក់ចំណេញ និងក្រុមហ៊ុនថ្មីក្នុងស្រុក ហើយនាងជាប្រធានគណៈកម្មការរចនាកម្មវិធីជប់លៀងប្រចាំឆ្នាំរបស់ JCI ភ្នំពេញ។",
      }),
      email: "monineath@example.com",
      phone: "012 456 789",
      socialUrl: "https://facebook.com/monineath.design",
      joinYear: 2012,
    },
    {
      slug: "heng-chanthou",
      name: "Heng Chanthou",
      businessName: "Chanthou Family Clinic",
      jobTitle: j({ en: "Managing Director", km: "នាយកគ្រប់គ្រង" }),
      industry: "Healthcare",
      bio: j({
        en: "Chanthou's clinic group has partnered with JCI on three free health-checkup caravans for underserved communities.",
        km: "ក្រុមគ្លីនិករបស់ចន្ធូ បានសហការជាមួយ JCI លើយុទ្ធនាការពិនិត្យសុខភាពឥតគិតថ្លៃចំនួន ៣ ដងសម្រាប់សហគមន៍ខ្វះខាត។",
      }),
      email: null,
      phone: "011 222 333",
      socialUrl: null,
      joinYear: 2018,
    },
    {
      slug: "mao-chenda",
      name: "Mao Chenda",
      businessName: "Chenda Finance Group",
      jobTitle: j({ en: "Senior Financial Advisor", km: "ទីប្រឹក្សាហិរញ្ញវត្ថុជាន់ខ្ពស់" }),
      industry: "Finance",
      bio: j({
        en: "Chenda advises small businesses on growth financing and regularly speaks at JCI's individual development workshops.",
        km: "ចិន្តាផ្តល់ប្រឹក្សាដល់អាជីវកម្មខ្នាតតូចលើការផ្តល់ហិរញ្ញប្បទានសម្រាប់ការរីកចម្រើន និងធ្វើជាវាគ្មិនជាប្រចាំនៅសិក្ខាសាលាអភិវឌ្ឍន៍បុគ្គលរបស់ JCI។",
      }),
      email: "chenda@example.com",
      phone: null,
      socialUrl: null,
      joinYear: 2016,
    },
    {
      slug: "nou-vireak",
      name: "Nou Vireak",
      businessName: "Vireak Tech Solutions",
      jobTitle: j({ en: "Chief Executive Officer", km: "នាយកប្រតិបត្តិ" }),
      industry: "Technology",
      bio: j({
        en: "Vireak's software company builds websites for local SMEs and donated the chapter's first digital registration system.",
        km: "ក្រុមហ៊ុនសូហ្វវែររបស់វីរៈ សាងសង់គេហទំព័រសម្រាប់សហគ្រាសខ្នាតតូចក្នុងស្រុក និងបានបរិច្ចាគប្រព័ន្ធចុះឈ្មោះឌីជីថលដំបូងរបស់សាខា។",
      }),
      email: "vireak@example.com",
      phone: "098 111 222",
      socialUrl: "https://linkedin.com/in/nouvireak",
      joinYear: 2017,
    },
    {
      slug: "chea-sophal",
      name: "Chea Sophal",
      businessName: "Sophal Legal Partners",
      jobTitle: j({ en: "Managing Partner", km: "ដៃគូគ្រប់គ្រង" }),
      industry: "Legal",
      bio: j({
        en: "Sophal's law firm provides pro-bono legal clinics for JCI's community outreach projects.",
        km: "ក្រុមហ៊ុនមេធាវីរបស់សុផល ផ្តល់សេវាប្រឹក្សាផ្នែកច្បាប់ដោយឥតគិតថ្លៃសម្រាប់គម្រោងសេវាសហគមន៍របស់ JCI។",
      }),
      email: "sophal@example.com",
      phone: null,
      socialUrl: null,
      joinYear: 2019,
    },
    {
      slug: "ouk-sothea",
      name: "Ouk Sothea",
      businessName: "Sothea Hospitality Group",
      jobTitle: j({ en: "General Manager", km: "នាយកទូទៅ" }),
      industry: "Hospitality",
      bio: j({
        en: "Sothea manages a boutique hotel group and hosted JCI's 2020 Annual General Assembly.",
        km: "សុធារគ្រប់គ្រងក្រុមសណ្ឋាគារប៊ូទិក និងបានជាម្ចាស់ផ្ទះមហាសន្និបាតប្រចាំឆ្នាំរបស់ JCI ក្នុងឆ្នាំ ២០២០។",
      }),
      email: null,
      phone: "010 333 444",
      socialUrl: null,
      joinYear: 2020,
    },
    {
      slug: "yim-kunthea",
      name: "Yim Kunthea",
      businessName: "Kunthea Marketing Agency",
      jobTitle: j({ en: "Founder", km: "ស្ថាបនិក" }),
      industry: "Marketing",
      bio: j({
        en: "Kunthea's agency handles social media for several JCI fundraising campaigns pro bono.",
        km: "ភ្នាក់ងាររបស់កុន្ធា ចាត់ចែងប្រព័ន្ធផ្សព្វផ្សាយសង្គមសម្រាប់យុទ្ធនាការរៃអង្គាសប្រាក់របស់ JCI ជាច្រើនដោយឥតគិតថ្លៃ។",
      }),
      email: "kunthea@example.com",
      phone: null,
      socialUrl: "https://instagram.com/kunthea.marketing",
      joinYear: 2021,
    },
    {
      slug: "lim-panha",
      name: "Lim Panha",
      businessName: "Panha Construction",
      jobTitle: j({ en: "Project Director", km: "នាយកគម្រោង" }),
      industry: "Construction",
      bio: j({
        en: "Panha oversaw the materials and labor planning for JCI's riverside cleanup infrastructure.",
        km: "ប៉ាញ៉ា ត្រួតពិនិត្យការរៀបចំសម្ភារៈ និងកម្លាំងពលកម្មសម្រាប់ហេដ្ឋារចនាសម្ព័ន្ធសម្អាតច្រាំងទន្លេរបស់ JCI។",
      }),
      email: null,
      phone: "017 555 666",
      socialUrl: null,
      joinYear: 2022,
    },
    {
      slug: "seng-dalis",
      name: "Seng Dalis",
      businessName: "Dalis Education Center",
      jobTitle: j({ en: "Director", km: "នាយិកា" }),
      industry: "Education",
      bio: j({
        en: "Dalis's learning center hosts JCI's digital literacy training for rural school partners.",
        km: "មជ្ឈមណ្ឌលសិក្សារបស់ដាលីស ជាកន្លែងសម្រាប់ការបណ្តុះបណ្តាលអក្ខរកម្មឌីជីថលរបស់ JCI សម្រាប់សាលារៀនដៃគូនៅជនបទ។",
      }),
      email: "dalis@example.com",
      phone: null,
      socialUrl: null,
      joinYear: 2023,
    },
    {
      slug: "vong-chariya",
      name: "Vong Chariya",
      businessName: "Chariya Real Estate",
      jobTitle: j({ en: "Broker", km: "ឈ្មួញកណ្តាលអចលនទ្រព្យ" }),
      industry: "Real Estate",
      bio: j({
        en: "Chariya joined in 2024 and now coordinates venue sourcing for JCI Phnom Penh's events.",
        km: "ចារីយ៉ាបានចូលរួមក្នុងឆ្នាំ ២០២៤ និងបច្ចុប្បន្នសម្របសម្រួលស្វែងរកទីតាំងសម្រាប់កម្មវិធីរបស់ JCI ភ្នំពេញ។",
      }),
      email: null,
      phone: null,
      socialUrl: null,
      joinYear: 2024,
    },
    {
      slug: "ros-sambath",
      name: "Ros Sambath",
      businessName: "Sambath Agritech",
      jobTitle: j({ en: "Founder", km: "ស្ថាបនិក" }),
      industry: "Agriculture",
      bio: j({
        en: "Sambath's agritech startup partners with JCI on rural livelihood and clean-water initiatives.",
        km: "ក្រុមហ៊ុនបច្ចេកវិទ្យាកសិកម្មរបស់សម្បត្តិ សហការជាមួយ JCI លើគម្រោងជីវភាពជនបទ និងទឹកស្អាត។",
      }),
      email: "sambath@example.com",
      phone: "095 777 888",
      socialUrl: null,
      joinYear: 2025,
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { slug: member.slug },
      update: member,
      create: member,
    });
  }

  // Real JCI Phnom Penh projects, grouped by the four official JCI pillars
  // (see src/lib/pillar-colors.ts for each pillar's committee color).
  const projects = [
    {
      slug: "breakfast-talk",
      title: j({ en: "Breakfast Talk", km: "Breakfast Talk" }),
      summary: j({
        en: "A regular morning networking session connecting members with business speakers and industry insights.",
        km: "សម័យប្រជុំបណ្តាញទំនាក់ទំនងអាជីវកម្មប្រចាំព្រឹក ជាកន្លែងចែករំលែកចំណេះដឹងជាមួយវាគ្មិនជំនាញ។",
      }),
      pillar: "BUSINESS_ENTREPRENEURSHIP",
      impactReportUrl: null,
    },
    {
      slug: "bdme-business-dialogue-matching-expo",
      title: j({ en: "Business Dialogue Matching Expo (BDME)", km: "Business Dialogue Matching Expo (BDME)" }),
      summary: j({
        en: "An expo connecting members and entrepreneurs through business dialogue and matchmaking opportunities.",
        km: "ពិព័រណ៍ភ្ជាប់ទំនាក់ទំនងអាជីវកម្ម ដែលផ្តល់ឱកាសឲ្យសមាជិក និងសហគ្រិនជួបគ្នា និងសហការគ្នា។",
      }),
      pillar: "BUSINESS_ENTREPRENEURSHIP",
      impactReportUrl: null,
    },
    {
      slug: "jci-pp-jib",
      title: j({ en: "JCI in Business (JiB)", km: "JCI in Business (JiB)" }),
      summary: j({
        en: "JCI Phnom Penh's business club bringing members together to grow their businesses together.",
        km: "ក្លឹបអាជីវកម្មរបស់ JCI ភ្នំពេញ ដែលជួយសមាជិកអភិវឌ្ឍអាជីវកម្ម ក្នុងបរិយាកាសរីករាយ។",
      }),
      pillar: "BUSINESS_ENTREPRENEURSHIP",
      impactReportUrl: null,
    },
    {
      slug: "young-leaders-program",
      title: j({ en: "Young Leaders Program (YLP)", km: "Young Leaders Program (YLP)" }),
      summary: j({
        en: "A leadership development track helping members build the skills and confidence to lead within JCI and beyond.",
        km: "កម្មវិធីអភិវឌ្ឍន៍អ្នកដឹកនាំវ័យក្មេង ជួយសមាជិកកសាងជំនាញ និងទំនុកចិត្តក្នុងការដឹកនាំ។",
      }),
      pillar: "INDIVIDUAL_DEVELOPMENT",
      impactReportUrl: null,
    },
    {
      slug: "gmm-general-membership-meeting",
      title: j({ en: "General Membership Meeting (GMM)", km: "General Membership Meeting (GMM)" }),
      summary: j({
        en: "Our regular membership meeting covering chapter updates, upcoming projects, and member engagement.",
        km: "កិច្ចប្រជុំសមាជិកទូទៅប្រចាំកាលកំណត់ ដើម្បីធ្វើបច្ចុប្បន្នភាពព័ត៌មាន និងគម្រោងនានា។",
      }),
      pillar: "INDIVIDUAL_DEVELOPMENT",
      impactReportUrl: null,
    },
    {
      slug: "jci-pp-member-gathering-after-hour",
      title: j({ en: 'Member Gathering ("After Hour")', km: 'Member Gathering ("After Hour")' }),
      summary: j({
        en: "An informal social gathering for members to connect, unwind, and build friendships outside of formal meetings.",
        km: "កម្មវិធីជួបជុំសមាជិកក្រៅផ្លូវការ សម្រាប់ការជួបជុំ និងកសាងមិត្តភាព។",
      }),
      pillar: "INDIVIDUAL_DEVELOPMENT",
      impactReportUrl: null,
    },
    {
      slug: "cambodia-kid-academy-program-ayep",
      title: j({ en: "Cambodia Kid Academy Program (AYEP)", km: "Cambodia Kid Academy Program (AYEP)" }),
      summary: j({
        en: "An international youth exchange and education program supporting children's development in Cambodia.",
        km: "កម្មវិធីផ្លាស់ប្តូរយុវជនអន្តរជាតិ ជួយគាំទ្រការអភិវឌ្ឍរបស់កុមារនៅកម្ពុជា។",
      }),
      pillar: "INTERNATIONAL_COOPERATION",
      impactReportUrl: null,
    },
    {
      slug: "bag-to-school-b2s",
      title: j({ en: "Bag to School (B2S)", km: "Bag to School (B2S)" }),
      summary: j({
        en: "A school-supplies donation drive providing bags and learning materials to children in need.",
        km: "យុទ្ធនាការបរិច្ចាគកាបូប និងសម្ភារៈសិក្សាដល់កុមារដែលត្រូវការ។",
      }),
      pillar: "COMMUNITY_IMPACT",
      impactReportUrl: null,
    },
    {
      slug: "sharing-of-smile-sos",
      title: j({ en: "Sharing of Smile (SOS)", km: "Sharing of Smile (SOS)" }),
      summary: j({
        en: "A community outreach initiative spreading joy and support to those who need it most.",
        km: "គំនិតផ្តួចផ្តើមសហគមន៍ដើម្បីចែករំលែកភាពរីករាយ និងជំនួយដល់អ្នកដែលត្រូវការ។",
      }),
      pillar: "COMMUNITY_IMPACT",
      impactReportUrl: null,
    },
  ];

  // Drop any projects from a previous seed run that aren't part of the
  // current real project list, so re-seeding always reflects it exactly.
  await prisma.project.deleteMany({
    where: { slug: { notIn: projects.map((p) => p.slug) } },
  });

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  await prisma.newsPost.upsert({
    where: { slug: "2026-aga-recap" },
    update: {},
    create: {
      slug: "2026-aga-recap",
      title: j({ en: "2026 Annual General Assembly Recap", km: "សង្ខេបមហាសន្និបាតប្រចាំឆ្នាំ ២០២៦" }),
      body: j({
        en: "Members gathered to elect the incoming board and celebrate a year of community impact.",
        km: "សមាជិកបានជួបជុំគ្នាដើម្បីជ្រើសរើសក្រុមប្រឹក្សាថ្មី និងអបអរឆ្នាំនៃផលប៉ះពាល់សហគមន៍។",
      }),
      publishedAt: new Date("2026-02-14"),
    },
  });

  const slides = [
    {
      id: "seed-slide-event",
      title: j({ en: "JCI Phnom Penh Gala Night 2026", km: "យប់អង្គជប់លៀង JCI ភ្នំពេញ ២០២៦" }),
      description: j({
        en: "An evening of celebration, awards, and fundraising — tickets are open now.",
        km: "យប់នៃការអបអរ ពានរង្វាន់ និងការរៃអង្គាសប្រាក់ — សំបុត្រកំពុងបើកលក់។",
      }),
      imageUrl: "/brand/slides/event-banner.png",
      linkUrl: "/events/jci-pp-gala-night-2026",
      category: "EVENT",
      sortOrder: 0,
    },
    {
      id: "seed-slide-news",
      title: j({ en: "2026 Annual General Assembly Recap", km: "សង្ខេបមហាសន្និបាតប្រចាំឆ្នាំ ២០២៦" }),
      description: j({
        en: "Catch up on what happened at this year's AGA.",
        km: "តាមដានអ្វីដែលបានកើតឡើងនៅមហាសន្និបាតឆ្នាំនេះ។",
      }),
      imageUrl: "/brand/slides/news-banner.png",
      linkUrl: "/news/2026-aga-recap",
      category: "NEWS",
      sortOrder: 1,
    },
    {
      id: "seed-slide-sponsor",
      title: j({ en: "Partner With Us on a Project", km: "ជាដៃគូជាមួយយើងលើគម្រោង" }),
      description: j({
        en: "See how sponsors are helping power our business, community, and leadership projects.",
        km: "មើលពីរបៀបដែលអ្នកឧបត្ថម្ភកំពុងជួយជំរុញគម្រោងអាជីវកម្ម សហគមន៍ និងភាពជាអ្នកដឹកនាំរបស់យើង។",
      }),
      imageUrl: "/brand/slides/sponsor-banner.png",
      linkUrl: "/sponsor",
      category: "SPONSOR",
      sortOrder: 2,
    },
    {
      id: "seed-slide-member",
      title: j({ en: "Meet Our Board & Members", km: "ស្គាល់ក្រុមប្រឹក្សា និងសមាជិករបស់យើង" }),
      description: j({
        en: "The volunteers leading JCI Phnom Penh this term.",
        km: "អ្នកស្ម័គ្រចិត្តដឹកនាំ JCI ភ្នំពេញ សម្រាប់អាណត្តិនេះ។",
      }),
      imageUrl: "/brand/slides/member-banner.png",
      linkUrl: "/members",
      category: "MEMBER",
      sortOrder: 3,
    },
  ];

  for (const slide of slides) {
    await prisma.slide.upsert({ where: { id: slide.id }, update: slide, create: slide });
  }

  const impactStats = [
    { key: "members", value: 120 },
    { key: "projects", value: 45 },
    { key: "events", value: 80 },
    { key: "beneficiaries", value: 15000 },
  ];

  for (const stat of impactStats) {
    await prisma.impactStat.upsert({
      where: { key: stat.key },
      update: { value: stat.value },
      create: stat,
    });
  }

  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const galaData = {
    title: j({ en: "JCI Phnom Penh Gala Night 2026", km: "យប់អង្គជប់លៀង JCI ភ្នំពេញ ២០២៦" }),
    description: j({
      en: "An evening of celebration, awards, and fundraising for our 2026 community projects.",
      km: "យប់នៃការអបអរ ពានរង្វាន់ និងការរៃអង្គាសប្រាក់សម្រាប់គម្រោងសហគមន៍ឆ្នាំ ២០២៦។",
    }),
    location: "Sokha Phnom Penh Hotel",
    mapUrl: "https://maps.google.com/?q=Sokha+Phnom+Penh+Hotel",
    startAt: new Date("2026-12-12T18:00:00+07:00"),
    endAt: new Date("2026-12-12T22:00:00+07:00"),
    telegramGroupUrl: "https://t.me/+jci_pp_gala_2026_demo",
    speakers: j([
      { name: "ENG Hakseng", title: "Local President, JCI Phnom Penh" },
      { name: "Ms. Channary Vong", title: "JCI Cambodia National President" },
    ]),
    agenda: j([
      { time: "18:00", title: "Registration & Welcome Reception" },
      { time: "18:30", title: "Opening Remarks" },
      { time: "19:00", title: "Dinner Service" },
      { time: "20:00", title: "Awards Ceremony" },
      { time: "21:00", title: "Fundraising Auction" },
      { time: "21:45", title: "Closing & Group Photo" },
    ]),
    published: true,
    organizerId: eventOrganizer.id,
  };

  const gala = await prisma.event.upsert({
    where: { slug: "jci-pp-gala-night-2026" },
    update: galaData,
    create: { slug: "jci-pp-gala-night-2026", ...galaData },
  });

  const [, standard] = await Promise.all([
    prisma.ticketTier.upsert({
      where: { id: "seed-gala-early-bird" },
      update: { saleEndsAt: new Date("2026-11-15T23:59:00+07:00") },
      create: {
        id: "seed-gala-early-bird",
        eventId: gala.id,
        name: j({ en: "Early Bird", km: "ចុះឈ្មោះមុនកំណត់" }),
        priceUsd: 25,
        capacity: 50,
        saleEndsAt: new Date("2026-11-15T23:59:00+07:00"),
        sortOrder: 0,
      },
    }),
    prisma.ticketTier.upsert({
      where: { id: "seed-gala-standard" },
      update: {},
      create: {
        id: "seed-gala-standard",
        eventId: gala.id,
        name: j({ en: "Standard", km: "ធម្មតា" }),
        priceUsd: 35,
        capacity: 100,
        sortOrder: 1,
      },
    }),
  ]);

  const gmmData = {
    title: j({ en: "March 2026 General Membership Meeting", km: "កិច្ចប្រជុំសមាជិកទូទៅ ខែមិនា ២០២៦" }),
    description: j({
      en: "Monthly GMM covering upcoming projects and new member orientation.",
      km: "កិច្ចប្រជុំប្រចាំខែស្តីពីគម្រោងនាពេលខាងមុខ និងការណែនាំសមាជិកថ្មី។",
    }),
    location: "JCI Phnom Penh Office",
    mapUrl: "https://maps.google.com/?q=JCI+Phnom+Penh+Office",
    startAt: new Date("2026-03-07T18:30:00+07:00"),
    endAt: new Date("2026-03-07T20:30:00+07:00"),
    telegramGroupUrl: "https://t.me/+jci_pp_gmm_march_2026_demo",
    speakers: j([{ name: "Chan Sopheak", title: "VP of Projects" }]),
    agenda: j([
      { time: "18:30", title: "Welcome & Check-In" },
      { time: "18:45", title: "New Member Orientation" },
      { time: "19:15", title: "Project Updates" },
      { time: "20:00", title: "Open Floor & Q&A" },
    ]),
    published: true,
    organizerId: eventOrganizer.id,
  };

  const gmm = await prisma.event.upsert({
    where: { slug: "march-2026-gmm" },
    update: gmmData,
    create: { slug: "march-2026-gmm", ...gmmData },
  });

  await prisma.ticketTier.upsert({
    where: { id: "seed-gmm-free" },
    update: {},
    create: {
      id: "seed-gmm-free",
      eventId: gmm.id,
      name: j({ en: "Member (Free)", km: "សមាជិក (ឥតគិតថ្លៃ)" }),
      priceUsd: 0,
      capacity: 60,
      sortOrder: 0,
    },
  });

  const sampleRegistrations = [
    {
      id: "seed-reg-1",
      fullName: "Pich Monineath",
      email: "monineath@example.com",
      phone: "012345678",
      isJciMember: true,
      jciChapter: "JCI Phnom Penh",
      status: "CONFIRMED",
      paymentStatus: "VERIFIED",
    },
    {
      id: "seed-reg-2",
      fullName: "Ly Seiha",
      email: "seiha@example.com",
      phone: "098765432",
      isJciMember: false,
      jciChapter: null,
      status: "PAYMENT_SUBMITTED",
      paymentStatus: "SUBMITTED",
    },
    {
      id: "seed-reg-3",
      fullName: "Heng Chanthou",
      email: "chanthou@example.com",
      phone: "011222333",
      isJciMember: true,
      jciChapter: "JCI Siem Reap",
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
    },
  ];

  for (const reg of sampleRegistrations) {
    const registration = await prisma.registration.upsert({
      where: { id: reg.id },
      update: {},
      create: {
        id: reg.id,
        eventId: gala.id,
        ticketTierId: standard.id,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone,
        isJciMember: reg.isJciMember,
        jciChapter: reg.jciChapter,
        status: reg.status,
      },
    });

    await prisma.payment.upsert({
      where: { registrationId: registration.id },
      update: {},
      create: {
        registrationId: registration.id,
        amountUsd: 35,
        qrPayload: "SEED-DEMO-PAYLOAD",
        status: reg.paymentStatus,
        verifiedById: reg.paymentStatus === "VERIFIED" ? superAdmin.id : null,
        verifiedAt: reg.paymentStatus === "VERIFIED" ? new Date() : null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "registration.payment.verify",
      entityType: "Registration",
      entityId: "seed-reg-1",
      metadata: j({ amountUsd: 35 }),
    },
  });

  console.log("Seed complete. Demo login password for all accounts:", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
