export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type JobCategory = 'Staff' | 'Worker';
export type WorkType = 'Shift' | 'Piece Rate' | 'Full-time' | 'Part-time';

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  location?: string;
  bio?: string;
  createdAt: any;
  memberSince: string;
  companyLogoUrl?: string; 
  onboarded?: boolean;
  status?: string;
  signupStatus?: string;
  category?: string;
  department?: string;
  designation?: string;
  email?: string;
  gst?: string;
  photo?: string;
  establishedYear?: string;
  fullAddress?: string;
  area?: string;
  contactPersonName?: string;
  contactNumber?: string;
  emailId?: string;
  latitude?: number;
  longitude?: number;
  postCredits?: number;
  totalPurchased?: number;
  totalUsed?: number;
  welcomeOfferClaimed?: boolean;
  subscription?: {
    activePlanId: string;
    price: number;
    expiryDate: string;
    planHistory: any[];
  };
  pendingLocationChange?: any;
  locationRequestStatus?: 'none' | 'change_requested' | 'approved' | 'rejected';
  dob?: string;
}

export interface Reference {
  name: string;
  designation: string;
  company: string;
  contact: string;
  email?: string;
  relationship?: string;
  remarks?: string; 
}

export interface AcademicRecord {
  education: string;
  degree: string;
  institute: string;
  year: string;
}

export interface TenureRecord {
  name: string;
  position: string;
  startDate: string;
  endDate: string;
  remarks?: string;
  isCurrent?: boolean;
}

export interface DigitalResume {
  personal: {
    fullName: string;
    gender: string;
    dob: string;
    age: string; 
    languages: string[];
    location: string;
    otherLocation?: string;
    mobile: string;
    hasTwoWheeler: boolean;
    profileImage?: string; 
    certificationAccepted: boolean;
  };
  academic: AcademicRecord[];
  professional: {
    totalExperience: string;
    noticePeriod: string;
    noticeDate?: string;
    coreSkills: string[];
    complianceKnowledge: string[]; 
    previousBrands: string;
    lastSalary: string;
    expectedSalary: string;
    buyersHandled?: string;
    auditExperience?: string;
    certifications?: string;
  };
  recentCompany: TenureRecord[];
  references: Reference[];
}

export interface JobSeekerProfile {
  userId: string;
  category: JobCategory;
  department: string;
  designation: string;
  experience: number;
  expectedSalary: number;
  workType: WorkType;
  accommodationNeeded: boolean;
  foodRequired: boolean;
  digitalResume?: DigitalResume;
  resumeUrl?: string;
}

export interface EmployerProfile {
  userId: string;
  companyName: string;
  companyLocation: string;
  contactPerson: string;
  isVerified: boolean;
  planType: 'basic' | 'growth' | 'pro' | 'enterprise';
  gstNumber: string;
  factoryPhotoUrl: string;
  establishedYear: string;
  memberSince: string;
  companyLogoUrl?: string;
}

export interface JobListing {
  id?: string;
  jobId: string;
  employerId: string;
  companyName: string;
  companyLogoUrl?: string; 
  jobTitle: string;
  category: JobCategory;
  department: string;
  designation: string;
  salaryMin: number;
  salaryMax: number;
  salaryBasis?: string;
  salaryType?: 'display_range' | 'not_disclosed' | 'negotiable' | 'experience_based' | 'company_standard';
  payoutSchedule: string;
  location: string;
  latitude?: number;
  longitude?: number;
  openings: number;
  experienceRequired: number;
  genderPreference: 'any' | 'male' | 'female';
  accommodationProvided: boolean;
  foodProvided: boolean;
  shiftTiming: string;
  workType: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'closed' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt?: any;
  deletedAt?: string;
  deletedBy?: string;
  gstNumber?: string;
  factoryPhotoUrl?: string;
  isEmployerVerified?: boolean;
  views: number;
  distance?: number; 
  benefits: {
    esi: boolean;
    epf: boolean;
    transport: boolean;
    bonus: string;
    teaCash: boolean;
    accommodation?: boolean;
    food?: boolean;
    attendance_incentive?: boolean;
    overtime_pay?: boolean;
    production_incentive?: boolean;
    referral_bonus?: boolean;
    bachelor_accommodation?: boolean;
    family_accommodation?: boolean;
    mobile_allowance?: boolean;
    petrol_allowance?: boolean;
    skill_training?: boolean;
    bonusEnabled?: boolean;
    bonusType?: 'percentage' | 'fixed' | null;
    bonusValue?: string | null;
  };
  interviewStartDate?: string | null;
  interviewEndDate?: string | null;
  interviewTimings?: string | null;
  autoCloseDate?: string | null;
  closedBy?: 'employer' | 'admin' | 'auto' | null;
  closedAt?: string | null;
}

export interface Application {
  id?: string;
  applicationId: string;
  jobId: string;
  jobSeekerId: string;
  employerId: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: any;
  jobTitle?: string;
  jobCategory?: string; 
  department?: string; 
  seekerName?: string;
  experience?: string;
  phone?: string;
  companyName?: string;
  preferredInterviewDate?: string | null;
  expectedSalary?: string | null; 
}

export interface Payment {
  paymentId: string;
  employerId: string;
  planType: string;
  amount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  razorpayPaymentId?: string;
  createdAt: string;
  baseAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmountPaid?: number;
}
