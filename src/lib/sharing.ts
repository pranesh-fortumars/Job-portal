/**
 * Centrally managed WhatsApp message template for Job Listings.
 * This file serves as the single source of truth for all industrial job sharing content.
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { translateLocation } from "./utils";
import { format, isValid } from "date-fns";

const STAFF_CHANNELS: Record<string, { name: string, url: string }> = {
  "FABRIC": { name: "Fabric Careers", url: "https://whatsapp.com/channel/0029Vb7ugkA1t90YQTfvzl0Q" },
  "PRINT & EMBROIDERY": { name: "Print & Embroidery Careers", url: "https://whatsapp.com/channel/0029VbCd6MY6rsQtkAR1ek0L" },
  "PRODUCTION": { name: "Production & Tech Careers", url: "https://whatsapp.com/channel/0029Vb7seZqDjiOdJ1NEoX0U" },
  "QUALITY": { name: "Quality Assurance Careers", url: "https://whatsapp.com/channel/0029VbDJLoWI7BeL8fYI6I0D" },
  "HR & ADMIN": { name: "HR & Admin Careers", url: "https://whatsapp.com/channel/0029VbD4ETE1NCrVGoXiGP35" },
  "ACCOUNTS & DOCS": { name: "Accounts & Documentation Careers", url: "https://whatsapp.com/channel/0029VbC9xmg1Hsq5OhdJDB2H" },
  "CAD & SAMPLING": { name: "Design & CAD Careers", url: "https://whatsapp.com/channel/0029Vb8RD1z3LdQaAh1BmN3K" },
  "ERP/EDP": { name: "IT, Software & EDP Careers", url: "https://whatsapp.com/channel/0029VbDLB5h7j6gCpQXAww2q" },
  "STORE": { name: "Store & Logistics Careers", url: "https://whatsapp.com/channel/0029VbCkh7eF6sn3XS3RL22P" },
  "UNCATEGORISED": { name: "Corporate & Tech Careers", url: "https://whatsapp.com/channel/0029VbD1Fwj4IBhIhhoBIW3T" }
};

const WORKER_CHANNELS: Record<string, { name: string, url: string }> = {
  "STITCHING": { name: "Stitching Jobs", url: "https://whatsapp.com/channel/0029Vb7yRn5AYlULaDAaPC31" },
  "CUTTING": { name: "Cutting Jobs", url: "https://whatsapp.com/channel/0029V875q6CxoAze16Mib1t" },
  "CHECKING": { name: "Checking Jobs", url: "https://whatsapp.com/channel/0029Vb7IoOxL7UVUaurhpB0i" },
  "IRONING & PACKING": { name: "Ironing & Packing Jobs", url: "https://whatsapp.com/channel/0029Vb87MOC6BIEirEg2vR0K" },
  "KNITTING": { name: "Knitting Jobs", url: "https://whatsapp.com/channel/0029Vb8QDpr4SpkEnMs6FA20" },
  "DYEING": { name: "Dyeing Jobs", url: "https://whatsapp.com/channel/0029VbCsPg4Dp2QGx9L2oz3u" },
  "COMPACTING": { name: "Compacting Jobs", url: "https://whatsapp.com/channel/0029VbD3RUfHwXbE7TODGD2j" },
  "PRINT / EMBROIDERY": { name: "Print & Embroidery Jobs", url: "https://whatsapp.com/channel/0029Vb8FGokAe5VtKU7xYo1x" },
  "UNCATEGORISED": { name: "Skilled Trades Jobs", url: "https://whatsapp.com/channel/0029VbDEe013WHTW0niebX1k" }
};

/**
 * Utility to convert timestamps or ISO strings into readable industrial dates.
 */
function formatIndustrialDate(val: any) {
  if (!val) return null;
  try {
    const date = val.toDate ? val.toDate() : new Date(val);
    if (!isValid(date)) return null;
    return format(date, "dd MMM yyyy");
  } catch (e) {
    return null;
  }
}

/**
 * Maps a job's category and department to the corresponding WhatsApp Channel.
 * Fix: Uses Department as primary routing key and implements robust cross-category lookup.
 */
export function getWhatsAppChannel(category: string, department: string) {
  const isStaff = category?.toLowerCase().trim() === 'staff';
  let dept = (department || "").toUpperCase().trim();
  
  // 1. Shorthand & Variant Normalization
  if (dept === "HR" || dept === "ADMIN") dept = "HR & ADMIN";
  if (dept === "ACCOUNTS" || dept === "DOCS") dept = "ACCOUNTS & DOCS";
  if (dept === "OTHERS") dept = "UNCATEGORISED";
  
  // Harmonize Print & Embroidery across maps
  if (dept === "PRINT & EMBROIDERY" || dept === "PRINT / EMBROIDERY" || dept === "PRINT" || dept === "EMBROIDERY") {
    dept = isStaff ? "PRINT & EMBROIDERY" : "PRINT / EMBROIDERY";
  }

  // 2. Select Maps
  const primaryMap = isStaff ? STAFF_CHANNELS : WORKER_CHANNELS;
  const secondaryMap = isStaff ? WORKER_CHANNELS : STAFF_CHANNELS;

  // 3. Routing Execution
  // Try primary map first (category preference), then secondary map (cross-lookup)
  const channel = primaryMap[dept] || secondaryMap[dept];
  
  if (channel) return channel;

  // 4. Final Fallback to Category-specific Uncategorised
  return primaryMap["UNCATEGORISED"];
}

/**
 * Generates a comprehensive, professional WhatsApp message for a job listing.
 * Includes EVERY industrial metric available on the details page.
 */
export function generateJobShareMessage(job: any, jobId: string, t?: any) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nextindia.in';
  const actualId = jobId || job.jobId || job.id;
  const jobUrl = `${origin}/jobs/${actualId}`;
  
  const sections: string[] = [];

  // 1. HEADER & PRIMARY IDENTITY
  const title = (job.jobTitle || job.designation || "Industrial Role").toUpperCase();
  sections.push(`🚨 *NEW JOB ALERT: ${title}*`);
  
  const identityLine = `🏭 *Factory:* ${job.companyName || "Verified Unit"}${job.isEmployerVerified ? ' ✅' : ''}`;
  const loc = t ? translateLocation(job.location, t) : job.location;
  sections.push(`${identityLine}\n📍 *Location:* ${loc}\n💼 *Role:* ${job.designation || "General"}\n🏢 *Department:* ${job.department || "Garments"}`);

  sections.push(`━━━━━━━━━━━━━━━━━━━━`);

  // 2. COMPENSATION & TIMING
  const compLines = [];
  if (job.salaryBasis === 'piece') {
    compLines.push(`💰 *Salary:* Piece Rate (Based on Output)`);
  } else if (job.salaryMin && job.salaryMax) {
    compLines.push(`💰 *Salary:* ₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} (${job.salaryBasis || 'Monthly'})`);
  }
  if (job.payoutSchedule) compLines.push(`📅 *Payout:* ${job.payoutSchedule}`);
  if (job.workType) compLines.push(`🕒 *Employment Type:* ${job.workType}`);
  if (job.shiftTiming) compLines.push(`🕒 *Shift Details:* ${job.shiftTiming}`);
  
  if (compLines.length > 0) sections.push(compLines.join('\n'));

  // 3. WELFARE & BENEFITS (Exhaustive List)
  if (job.benefits) {
    const b = job.benefits;
    const activePerks = [];
    
    // Core Benefit Mapping
    const perkMap: Record<string, string> = {
      esi: "ESI & EPF Benefits",
      epf: "EPF Coverage",
      transport: "Free Transport (Company Bus)",
      food: "Free Meals / Food Provided",
      teaCash: "Tea Cash Benefits",
      attendance_incentive: "Attendance Incentive",
      overtime_pay: "Overtime Pay (OT)",
      production_incentive: "Production Incentive",
      referral_bonus: "Referral Bonus",
      bachelor_accommodation: "Bachelor Hostel",
      family_accommodation: "Family Accommodation",
      accommodation: "Hostel Provided",
      mobile_allowance: "Mobile Allowance",
      petrol_allowance: "Petrol Allowance",
      skill_training: "Professional Skill Training"
    };

    Object.keys(perkMap).forEach(key => {
      if (b[key] === true) activePerks.push(`• ${perkMap[key]}`);
    });

    if (b.bonusEnabled) {
      const bonusVal = b.bonusValue ? (b.bonusType === 'percentage' ? `${b.bonusValue}%` : `₹${b.bonusValue}`) : "Standard";
      activePerks.push(`• Bonus / Gift (${bonusVal})`);
    }

    if (activePerks.length > 0) {
      sections.push(`🎁 *WELFARE & BENEFITS:*\n${activePerks.join('\n')}`);
    }
  }

  // 4. REQUIREMENTS & ELIGIBILITY
  const reqLines = [];
  const genderText = job.genderPreference === 'male' ? "Male Preferred" : job.genderPreference === 'female' ? "Female Preferred" : "Any Gender";
  reqLines.push(`👤 *Gender:* ${genderText}`);
  reqLines.push(`💼 *Experience:* ${job.experienceRequired || '0'}+ Years Required`);
  if (job.openings) reqLines.push(`👥 *Vacancies:* ${job.openings} Seats Available`);
  if (job.certifications) reqLines.push(`🎓 *Qualification:* ${job.certifications}`);
  
  if (reqLines.length > 0) sections.push(`📋 *REQUIREMENTS:*\n${reqLines.join('\n')}`);

  // 5. TECHNICAL ASSETS (For Staff)
  const techLines = [];
  if (job.coreSkills && job.coreSkills.length > 0) {
    const skills = Array.isArray(job.coreSkills) ? job.coreSkills.join(', ') : job.coreSkills;
    techLines.push(`• *Skills:* ${skills}`);
  }
  if (job.buyersHandled) techLines.push(`• *Buyers:* ${job.buyersHandled}`);
  if (job.auditExperience) techLines.push(`• *Audit Know-how:* ${job.auditExperience}`);
  
  if (techLines.length > 0) sections.push(`🛠️ *TECHNICAL ASSETS:*\n${techLines.join('\n')}`);

  // 6. INTERVIEW & LIFECYCLE
  const scheduleLines = [];
  const formattedStart = formatIndustrialDate(job.interviewStartDate);
  if (formattedStart) {
    let dateStr = `📆 *Interview Dates:* ${formattedStart}`;
    const formattedEnd = formatIndustrialDate(job.interviewEndDate);
    if (formattedEnd && formattedEnd !== formattedStart) dateStr += ` to ${formattedEnd}`;
    scheduleLines.push(dateStr);
  }
  if (job.interviewTimings) scheduleLines.push(`⏰ *Interview Timing:* ${job.interviewTimings}`);
  
  const formattedExpiry = formatIndustrialDate(job.autoCloseDate);
  if (formattedExpiry) scheduleLines.push(`⌛ *Closing Date:* ${formattedExpiry}`);

  if (scheduleLines.length > 0) sections.push(`📅 *SCHEDULE:*\n${scheduleLines.join('\n')}`);

  // 7. DESCRIPTION
  if (job.description) {
    sections.push(`📝 *Job Description:* \n"${job.description.slice(0, 600)}${job.description.length > 600 ? '...' : ''}"`);
  }

  // 8. CONTACT (If present)
  if (job.contactDetails) {
     sections.push(`📱 *Contact:* ${job.contactDetails}`);
  }

  sections.push(`━━━━━━━━━━━━━━━━━━━━`);

  // 9. CALL TO ACTION
  sections.push(`🔗 *Apply Now:* \n${jobUrl}\n\n*Verified Opportunity*`);

  return sections.join('\n\n');
}

/**
 * Executes a department-based WhatsApp Channel routing and logging.
 */
export async function routeJobToWhatsApp(job: any, jobId: string, sharedByUid: string, db: any, t?: any) {
  const channel = getWhatsAppChannel(job.category, job.department);
  const message = generateJobShareMessage(job, jobId, t);
  
  try {
    await navigator.clipboard.writeText(message);
  } catch (err) {
    console.error("Clipboard copy failed", err);
  }

  if (typeof window !== 'undefined') {
    // Correct Existing WhatsApp Job-Posting Mechanism (Share API)
    openWhatsAppShare(message);
  }

  try {
    await addDoc(collection(db, "SharingLogs"), {
      jobId,
      department: job.department,
      channelName: channel.name,
      sharedBy: sharedByUid,
      shareDate: serverTimestamp(),
      shareStatus: "success"
    });
  } catch (err) {
    console.error("Sharing log failed", err);
  }
}

/**
 * Generates a pre-formatted WhatsApp message for a shortlisted candidate.
 */
export function generateCandidateShortlistMessage(app: any) {
  const name = app.seekerName || "Candidate";
  const role = app.jobTitle || "Role";
  const dept = app.department || "General";
  const company = app.companyName || "Verified Employer";

  return `Hello *${name}*,
 
Congratulations! Your application for the position of *${role}* (Dept: *${dept}*) at *${company}* has been *Shortlisted*.
 
The recruitment team will contact you shortly regarding the next steps for your interview.
 
Best Regards,
Team ${company}`;
}

/**
 * Utility to open WhatsApp with a pre-filled message.
 * Implements strict UTF-8 URL encoding to ensure emojis render correctly in WhatsApp.
 */
export function openWhatsAppShare(message: string) {
  // api.whatsapp.com is more robust for cross-platform deep-linking with UTF-8 payloads
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}
