export const CAMPUS_INFO = {
  name: "National Institute of Technology Andhra Pradesh",
  shortName: "NIT Andhra Pradesh",
  code: "NIT-AP",
  tagline: "Empowering Campus Life, Connecting Students",
  location: "Tadepalligudem, West Godavari District, Andhra Pradesh - 534101",
  emailDomain: "nitandhra.ac.in",
};

export const GRADUATION_YEARS = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
  "2031",
  "2032",
] as const;

export function isCampusEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean.endsWith("@nitandhra.ac.in") || clean.endsWith(".nitandhra.ac.in");
}

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Chemical Engineering",
  "Metallurgical & Materials Engineering",
  "Dean / Administration",
] as const;

export const CAMPUS_LANDMARKS = [
  "Sarvepalli Radhakrishnan Bhavan (Admin & Classroom Complex)",
  "Central Library & Information Centre",
  "Central Computer Centre (CCC)",
  "Student Activity Center (SAC) & Indoor Courts",
  "SAC Main Sports Ground (Football/Cricket)",
  "Hall of Residence 1 (Boys)",
  "Hall of Residence 2 (Boys)",
  "Hall of Residence 3 (Boys)",
  "Hall of Residence 4 (Girls)",
  "Central Mess 1 (Dining Hall A)",
  "Central Mess 2 (Dining Hall B)",
  "Academic Complex — CSE Labs",
  "Academic Complex — ECE Labs",
  "Campus Main Entrance Security Gate",
  "Open Air Theatre (OAT)",
  "Faculty & Staff Quarters",
] as const;

export const EVENT_CATEGORIES = [
  { value: "ALL", label: "All Events" },
  { value: "TECHNICAL", label: "Technical & Hackathons", color: "blue" },
  { value: "CULTURAL", label: "Cultural & Arts", color: "purple" },
  { value: "SPORTS", label: "Sports & Athletics", color: "green" },
  { value: "WORKSHOPS", label: "Workshops & Tech Talks", color: "amber" },
  { value: "VOLUNTEERING", label: "Volunteering & Social", color: "emerald" },
  { value: "OTHER", label: "Other Campus Gatherings", color: "gray" },
] as const;

export const LOST_FOUND_CATEGORIES = [
  { value: "ALL", label: "All Items" },
  { value: "ID_CARDS", label: "Student & Staff ID Cards" },
  { value: "ELECTRONICS", label: "Electronics & Gadgets" },
  { value: "BOOKS", label: "Books & Study Materials" },
  { value: "WALLETS", label: "Wallets & Cards" },
  { value: "KEYS", label: "Keys & Locks" },
  { value: "ACCESSORIES", label: "Bags & Accessories" },
  { value: "OTHER", label: "Other Belongings" },
] as const;

export const COMMUNITY_CATEGORIES = [
  { value: "ALL", label: "All Discussions" },
  { value: "TEAMMATES", label: "Project & Hackathon Teammates", icon: "Users" },
  { value: "SPORTS", label: "Sports & Fitness Partners", icon: "Trophy" },
  { value: "RIDESHARE", label: "Ride Sharing & Travel (Tadepalligudem)", icon: "Car" },
  { value: "RESOURCES", label: "Notes, Books & Equipment Sharing", icon: "BookOpen" },
  { value: "HELP", label: "Help Requests & Volunteering", icon: "LifeBuoy" },
  { value: "ROOMMATES", label: "Hostel & Roommate Search", icon: "Home" },
  { value: "GENERAL", label: "General Campus Buzz", icon: "MessageCircle" },
] as const;

export const PHILANTHROPY_CATEGORIES = [
  { value: "ALL", label: "All Causes" },
  { value: "ANIMAL_WELFARE", label: "Campus Stray Animal Welfare" },
  { value: "STUDENT_EMERGENCY", label: "Student Emergency & Medical Relief" },
  { value: "CAMPUS_PROJECT", label: "Student Innovation & Competitions" },
  { value: "RURAL_OUTREACH", label: "Rural Education & Community Outreach" },
  { value: "COMMUNITY", label: "Campus Green & Infrastructure" },
] as const;
