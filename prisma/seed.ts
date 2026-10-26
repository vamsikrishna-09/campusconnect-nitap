import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CampusConnect database for NIT Andhra Pradesh...");

  // Clear existing records to ensure clean state
  await prisma.notification.deleteMany();
  await prisma.contentReport.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.lostAndFoundClaim.deleteMany();
  await prisma.lostAndFoundItem.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.campus.deleteMany();

  // 1. Create Campus
  const campus = await prisma.campus.create({
    data: {
      name: "National Institute of Technology Andhra Pradesh",
      code: "NIT-AP",
      location: "Tadepalligudem, West Godavari District, Andhra Pradesh - 534101",
    },
  });

  // Common password hash for demo accounts: "Password123!"
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 2. Create Users
  const studentUser = await prisma.user.create({
    data: {
      name: "Arun Kumar",
      email: "arun.cse@nitandhra.ac.in",
      passwordHash,
      rollNumber: "421101",
      department: "Computer Science & Engineering",
      graduationYear: 2026,
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      bio: "Final year CSE student. Passionate about Open Source, Web3, and organizing HackNITAP.",
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      campusId: campus.id,
    },
  });

  const moderatorUser = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.ece@nitandhra.ac.in",
      passwordHash,
      rollNumber: "422215",
      department: "Electronics & Communication Engineering",
      graduationYear: 2026,
      phone: "+91 98765 43211",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
      bio: "Pre-final year ECE student & Student Council Representative. CampusConnect Moderator.",
      role: "MODERATOR",
      verificationStatus: "VERIFIED",
      campusId: campus.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Prof. K. Ramesh",
      email: "admin@nitandhra.ac.in",
      passwordHash,
      rollNumber: "FAC-084",
      department: "Dean of Student Affairs / Administration",
      graduationYear: 2012,
      phone: "+91 98765 43212",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
      bio: "Faculty In-Charge & Dean of Student Welfare, NIT Andhra Pradesh.",
      role: "ADMIN",
      verificationStatus: "VERIFIED",
      campusId: campus.id,
    },
  });

  const unverifiedStudent = await prisma.user.create({
    data: {
      name: "Rahul Varma",
      email: "rahul.eee@nitandhra.ac.in",
      passwordHash,
      rollNumber: "423340",
      department: "Electrical & Electronics Engineering",
      graduationYear: 2027,
      phone: "+91 98765 43213",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      bio: "Sophomore EEE student. Interested in Robotics and IoT sensors.",
      role: "STUDENT",
      verificationStatus: "PENDING", // Used to test Admin Verification Flow
      idCardUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      campusId: campus.id,
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      name: "Sneha Reddy",
      email: "sneha.mech@nitandhra.ac.in",
      passwordHash,
      rollNumber: "422409",
      department: "Mechanical Engineering",
      graduationYear: 2026,
      phone: "+91 98765 43214",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250",
      bio: "Team Lead at Vulcan Racing Club. CAD & Electric Vehicle enthusiast.",
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      campusId: campus.id,
    },
  });

  // 3. Create Events
  const event1 = await prisma.event.create({
    data: {
      title: "Vulcanzy 2026 — Annual National Techno-Cultural Fest",
      slug: "vulcanzy-2026-annual-fest",
      description: "NIT Andhra Pradesh's flagship annual national techno-cultural festival bringing together 3,000+ students from across India for 3 days of competitive coding, robotics, EDM nights, pro-shows, and art exhibits.",
      category: "CULTURAL",
      venue: "Open Air Theatre & Sarvepalli Radhakrishnan Bhavan, NIT-AP",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: "10:00 AM",
      endTime: "10:00 PM",
      registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      capacity: 500,
      coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
      organizerName: "Vulcanzy Organizing Council",
      organizerContact: "vulcanzy@nitandhra.ac.in",
      status: "UPCOMING",
      userId: adminUser.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "HackNITAP 2026: 36-Hour National Collegiate Hackathon",
      slug: "hacknitap-2026-36h-hackathon",
      description: "Join the biggest student hackathon in West Godavari! Build solutions for Smart Agriculture, AI in Healthcare, and Campus Automation. Prizes worth ₹1,50,000 and internship opportunities with leading tech firms.",
      category: "TECHNICAL",
      venue: "Central Computer Centre (CCC) & CSE Lab Complex",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: "09:00 AM",
      endTime: "09:00 PM (Next Day)",
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      capacity: 120,
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      organizerName: "Department of CSE & Coding Club",
      organizerContact: "hackathon@nitandhra.ac.in",
      status: "UPCOMING",
      userId: studentUser.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Inter-Department Football & Cricket Cup 2026",
      slug: "inter-department-football-cup-2026",
      description: "Annual sports tournament pitting CSE, ECE, EEE, Mech, Civil, Biotech, and Chemical against each other. Refreshments provided. Support your branch!",
      category: "SPORTS",
      venue: "Student Activity Center (SAC) Sports Grounds",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      startTime: "04:30 PM",
      endTime: "07:30 PM",
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      capacity: 200,
      coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
      organizerName: "NIT-AP Sports Council",
      organizerContact: "sports@nitandhra.ac.in",
      status: "UPCOMING",
      userId: studentUser2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "NVIDIA Hands-On Workshop: Deep Learning with PyTorch",
      slug: "nvidia-hands-on-deep-learning-pytorch",
      description: "Official DLI-certified workshop covering CNNs, Transformers, and GPU acceleration. Free certification for all participants who complete the lab assessment.",
      category: "WORKSHOPS",
      venue: "Central Library Audio-Visual Seminar Hall",
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      startTime: "02:00 PM",
      endTime: "06:00 PM",
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      capacity: 60,
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
      organizerName: "IEEE Student Branch NIT-AP",
      organizerContact: "ieee@nitandhra.ac.in",
      status: "UPCOMING",
      userId: moderatorUser.id,
    },
  });

  // Pre-register student to event1 and event2
  await prisma.eventRegistration.create({
    data: {
      eventId: event1.id,
      userId: studentUser.id,
      status: "CONFIRMED",
    },
  });
  await prisma.eventRegistration.create({
    data: {
      eventId: event2.id,
      userId: moderatorUser.id,
      status: "CONFIRMED",
    },
  });

  // 4. Create Lost and Found Items
  const lostItem1 = await prisma.lostAndFoundItem.create({
    data: {
      title: "Student ID Card — Roll No 422215 (ECE Branch)",
      description: "Lost my laminated official institute identity card with blue NIT Andhra Pradesh branded lanyard. Lost around lunch time between SRK Bhavan and Central Mess.",
      type: "LOST",
      category: "ID_CARDS",
      campusLocation: "Sarvepalli Radhakrishnan Bhavan / Central Mess walkway",
      itemDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      contactMethod: "IN_APP",
      contactDetails: "Contact via CampusConnect message or drop at Security Desk",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
      status: "OPEN",
      userId: moderatorUser.id,
    },
  });

  const foundItem1 = await prisma.lostAndFoundItem.create({
    data: {
      title: "Casio FX-991EX ClassWiz Scientific Calculator",
      description: "Found an original black Casio FX-991EX calculator left on Desk #14 in CSE Lab 2 after the Afternoon Signals & Systems lab session. Has a small silver sticker on the back cover.",
      type: "FOUND",
      category: "ELECTRONICS",
      campusLocation: "Academic Complex — CSE Lab 2",
      itemDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      contactMethod: "IN_APP",
      contactDetails: "Submit a claim with proof of sticker description to retrieve",
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&q=80&w=600",
      status: "OPEN",
      userId: studentUser.id,
    },
  });

  const lostItem2 = await prisma.lostAndFoundItem.create({
    data: {
      title: "Set of 3 Room Keys with Batman Rubber Keychain",
      description: "Misplaced my hostel room keys (Room 214, Hall of Residence 3). Very urgent as my roommate is also out of station.",
      type: "LOST",
      category: "KEYS",
      campusLocation: "Student Activity Center (SAC) Badminton Court",
      itemDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      contactMethod: "PHONE",
      contactDetails: "+91 98765 43214",
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600",
      status: "OPEN",
      userId: studentUser2.id,
    },
  });

  const resolvedItem = await prisma.lostAndFoundItem.create({
    data: {
      title: "Boat Airdopes 141 (Black Case)",
      description: "Found wireless earbuds left on 1st Floor Study Cubicle in Central Library.",
      type: "FOUND",
      category: "ELECTRONICS",
      campusLocation: "Central Library 1st Floor",
      itemDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      contactMethod: "IN_APP",
      status: "RESOLVED",
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      userId: studentUser.id,
    },
  });

  // 5. Create Community Posts
  const post1 = await prisma.communityPost.create({
    data: {
      title: "Looking for 2 MERN / Next.js developers for Smart India Hackathon (SIH 2026)",
      content: "Hey folks! Our team 'ByteCrafters' is preparing for the internal SIH selection at NIT-AP. We currently have an AI/ML specialist and a UI/UX designer. We need 2 enthusiastic developers proficient with React/Next.js and REST/Node APIs. Pre-final or final year students preferred. Let's build something impactful!",
      category: "TEAMMATES",
      tags: "SIH2026,WebDev,Hackathon,CSE",
      userId: studentUser.id,
      isPinned: true,
      status: "ACTIVE",
    },
  });

  const post2 = await prisma.communityPost.create({
    data: {
      title: "Shared cab pool: Tadepalligudem Railway Station to NIT Campus (Sunday 6:30 AM)",
      content: "Arriving via 12728 Godavari Express this Sunday morning. Looking for 2-3 fellow students to split an auto/cab from TDD station to the hostel gate. Safe, fast, and saves cost!",
      category: "RIDESHARE",
      tags: "RideShare,Tadepalligudem,Travel,GodavariExpress",
      userId: moderatorUser.id,
      status: "ACTIVE",
    },
  });

  const post3 = await prisma.communityPost.create({
    data: {
      title: "Handwritten Operating Systems & DBMS Notes for End-Sem Exam Revision",
      content: "Compiled 120 pages of concise handwritten notes covering Process Synchronization, Deadlocks, Paging, SQL B-Trees, and Normalization based on NIT-AP syllabus. You can access the PDF link or photocopy it at the Central Library store.",
      category: "RESOURCES",
      tags: "Academics,Notes,CSE,Exams",
      userId: studentUser2.id,
      status: "ACTIVE",
    },
  });

  const post4 = await prisma.communityPost.create({
    data: {
      title: "Anyone playing Volleyball / Badminton at SAC Courts daily evening?",
      content: "Looking to form a regular group for 6:00 PM volleyball or badminton matches at SAC. All skill levels welcome. Drop a comment if interested!",
      category: "SPORTS",
      tags: "Sports,SAC,Volleyball,Fitness",
      userId: studentUser.id,
      status: "ACTIVE",
    },
  });

  // Add Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: moderatorUser.id,
      content: "Hey Arun! I have hands-on experience with Next.js App Router and Prisma. Would love to connect and discuss the problem statement.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      userId: studentUser2.id,
      content: "Count me in! I am on the same train in coach S4. Will DM you my WhatsApp number.",
    },
  });

  // Add Reactions
  await prisma.reaction.create({
    data: {
      postId: post1.id,
      userId: moderatorUser.id,
      type: "LIKE",
    },
  });
  await prisma.reaction.create({
    data: {
      postId: post1.id,
      userId: studentUser2.id,
      type: "HELPFUL",
    },
  });

  // 6. Create Philanthropy Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      title: "NIT-AP Campus Paws: Stray Animal Healthcare, Vaccination & Winter Feeding",
      slug: "campus-paws-vaccination-care",
      shortSummary: "Comprehensive vaccination, anti-rabies immunisation, neutering, and winter food shelter for 28 resident campus community dogs at NIT Andhra Pradesh.",
      story: `Over the past two years, our 172-acre permanent campus at Tadepalligudem has become home to nearly 30 stray dogs. While they are friendly and guard the hostel perimeters, their welfare, annual vaccination, and humane population control require active community care.

Our student-led initiative **Campus Paws NIT-AP**, in partnership with the Tadepalligudem Government Veterinary Hospital and local animal welfare volunteers, is organizing:
1. **Annual Anti-Rabies & 7-in-1 Vaccinations** for 28 resident dogs.
2. **Humane Spay/Neuter Surgeries** (ABC program) to control population humanely.
3. **Deworming & Tick treatments** to prevent skin mange and zoonotic diseases.
4. **Reflective Night Collars** to prevent nighttime vehicular accidents on ring roads.
5. **Weatherproof wooden feeding stations** near hostel backyards.

Every single rupee raised will be audited and published on this portal along with veterinary bills and medicine receipts. Join hands to keep our campus safe, compassionate, and healthy!`,
      category: "ANIMAL_WELFARE",
      coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
      targetAmount: 45000,
      raisedAmount: 32500,
      beneficiaryInfo: "28 Community dogs residing inside the NIT Andhra Pradesh campus.",
      fundUsagePlan: "₹18,000 for 7-in-1 vaccines & Anti-Rabies ampoules; ₹15,000 for vet sterilization post-op care; ₹7,000 for tick medication & dewormers; ₹5,000 for 30 reflective safety collars and insulated feeding sheds.",
      supportingDocsUrl: "https://nitandhra.ac.in/campus-welfare/paws-proposal-2026.pdf",
      status: "VERIFIED",
      verificationNotes: "Approved by Dean of Student Affairs. Verified medical quotation from Tadepalligudem Veterinary Clinic.",
      verifiedByAdminId: adminUser.id,
      verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      userId: studentUser.id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: "Team Vulcan Racing: Fabrication of All-Terrain Electric Buggy for BAJA SAE",
      slug: "team-vulcan-baja-sae-electric-buggy",
      shortSummary: "Empowering 35 mechanical & electrical engineering students of NIT-AP to fabricate an indigenous electric ATV for the prestigious BAJA SAE India 2026 competition.",
      story: `Team Vulcan Racing is the official student formula and off-road mobility club of NIT Andhra Pradesh. After ranking in the Top 15 in the virtual design evaluation rounds nationwide, our multidisciplinary team is now building the physical electric ATV chassis, custom suspension linkages, and lithium iron phosphate (LiFePO4) battery pack in the campus central workshop.

We have self-funded the frame materials through student club funds, but we require financial backing from alumni, students, and faculty to purchase:
- Custom hydraulic disc brake assemblies
- Planetary gearbox and high-torque PMSM electric motor
- FIA-approved safety harness, fire suppression systems, and driver gear.

Your contributions will be acknowledged on the buggy's livery and our national competition banner!`,
      category: "CAMPUS_PROJECT",
      coverImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
      targetAmount: 150000,
      raisedAmount: 98000,
      beneficiaryInfo: "Team Vulcan Racing — Student Collegiate Club, NIT-AP",
      fundUsagePlan: "Motor & Controller: ₹65,000 | Safety equipment & Harness: ₹35,000 | Custom differential & suspension: ₹50,000",
      supportingDocsUrl: "https://nitandhra.ac.in/clubs/vulcan-racing/baja2026-design-report.pdf",
      status: "VERIFIED",
      verificationNotes: "Verified by Department of Mechanical Engineering and Student Activity Center.",
      verifiedByAdminId: adminUser.id,
      verifiedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      userId: studentUser2.id,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });

  const campaign3Pending = await prisma.campaign.create({
    data: {
      title: "Rural STEM Outreach: Science Kits for Zilla Parishad High School, Tadepalligudem",
      slug: "rural-stem-science-kits-tadepalligudem",
      shortSummary: "Providing interactive physics, chemistry, and electronics learning kits for 150 underprivileged 8th-10th grade students in local government schools.",
      story: `The Student Social Responsibility Cell (SSRC) at NIT Andhra Pradesh has adopted the Zilla Parishad High School near Tadepalligudem rural Mandal. The school has bright, curious students but lacks hands-on science lab apparatus.

We aim to purchase 25 STEM starter kits (basic robotics, optics mirrors, chemical test sets, and solar kits) and conduct weekend mentoring sessions taught by NIT-AP student volunteers.`,
      category: "RURAL_OUTREACH",
      coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
      targetAmount: 25000,
      raisedAmount: 0,
      beneficiaryInfo: "Students of ZP High School, Tadepalligudem Mandal",
      fundUsagePlan: "₹18,000 for 25 STEM hands-on kits; ₹4,000 for notebooks and stationery; ₹3,000 for student travel & refreshments.",
      supportingDocsUrl: "https://nitandhra.ac.in/ssrc/outreach-permission-letter.pdf",
      status: "PENDING_REVIEW", // PENDING REVIEW - Demonstrates Admin Verification Flow!
      userId: moderatorUser.id,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  // Add Donations to Campaign 1
  await prisma.donation.create({
    data: {
      campaignId: campaign1.id,
      donorId: moderatorUser.id,
      donorName: "Priya Sharma",
      donorEmail: "priya.ece@nitandhra.ac.in",
      amount: 1500,
      isAnonymous: false,
      message: "So proud of this initiative! Hope all campus indie dogs get healthy and vaccinated.",
      transactionRef: "TXN_DEMO_982341",
      paymentMethod: "DEMO_UPI",
      status: "SUCCESS",
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campaign1.id,
      donorId: studentUser2.id,
      donorName: "Sneha Reddy",
      donorEmail: "sneha.mech@nitandhra.ac.in",
      amount: 2000,
      isAnonymous: false,
      message: "Contributing from Mechanical department! Keep up the great work.",
      transactionRef: "TXN_DEMO_982342",
      paymentMethod: "DEMO_CARD",
      status: "SUCCESS",
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campaign1.id,
      donorName: "Anonymous Well-Wisher",
      amount: 5000,
      isAnonymous: true,
      message: "For our furry campus companions.",
      transactionRef: "TXN_DEMO_982343",
      paymentMethod: "DEMO_UPI",
      status: "SUCCESS",
    },
  });

  // Campaign Update
  await prisma.campaignUpdate.create({
    data: {
      campaignId: campaign1.id,
      title: "Phase 1 Vaccination Completed — 14 Dogs Vaccinated!",
      content: "Great news! On Sunday, the veterinary medical team visited the campus. 14 resident dogs in the North & West hostel zones were successfully vaccinated against rabies and given deworming pills. Photos and receipts attached to the transparency drive.",
      imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
    },
  });

  // 7. Create Sample Content Report for Moderator Dashboard testing
  await prisma.contentReport.create({
    data: {
      reporterId: studentUser.id,
      targetType: "POST",
      targetId: post4.id,
      reason: "Potential spam / commercial promotion",
      details: "Checking if sports equipment promotion requires moderator review.",
      status: "PENDING",
    },
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: "Registration Confirmed!",
      message: "You have successfully registered for Vulcanzy 2026. Keep your digital badge ready.",
      link: `/events/${event1.id}`,
      type: "EVENT",
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: "New Donation Received",
      message: "Sneha Reddy donated ₹2,000 to Campus Paws NIT-AP.",
      link: `/philanthropy/${campaign1.id}`,
      type: "PHILANTHROPY",
    },
  });

  await prisma.notification.create({
    data: {
      userId: moderatorUser.id,
      title: "New Content Report Pending",
      message: "A community post was reported by Arun Kumar for review.",
      link: "/moderator",
      type: "INFO",
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "New Campaign Awaiting Verification",
      message: "Rural STEM Outreach has been submitted for administrator review.",
      link: "/admin",
      type: "VERIFICATION",
    },
  });

  console.log("✅ Seed finished successfully!");
  console.log("Demo Accounts Created:");
  console.log("1. Student:   arun.cse@nitandhra.ac.in   (Password: Password123!)");
  console.log("2. Moderator: priya.ece@nitandhra.ac.in  (Password: Password123!)");
  console.log("3. Admin:     admin@nitandhra.ac.in      (Password: Password123!)");
  console.log("4. Unverified: rahul.eee@nitandhra.ac.in (Password: Password123!)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
