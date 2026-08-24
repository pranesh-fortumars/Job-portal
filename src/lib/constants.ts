export const WORKER_CLASSIFICATION = {
  "SALES & BIZ DEV": ["Business Development Executive", "Sales Executive"],
  "HR & ADMIN": ["HR Manager", "Customer Support", "Operations Manager"],
  "MARKETING": ["Marketing Executive", "Content Writer"],
  STITCHING: ["Overlock Tailor", "Flatlock Tailor", "Singer Tailor", "Multi Tailor", "Sample Tailor", "Sewing Helper", "Singer Contractor", "Powertable Contractor"],
  CUTTING: ["Cutting Master", "Cutting Helper", "Cutting Operator", "Spreader Operator", "Stickering Helper", "Cutting Contractor"],
  CHECKING: ["Trimmer", "Checker", "Sain Remove Operator", "Checking Contractor"],
  "IRONING & PACKING": ["Ironing Master", "Ironing Contractor", "Packer", "Packing Helper", "Packing Contractor", "Needle Detector Operator"],
  KNITTING: ["Knitting Foreman", "Knitting Operator"],
  DYEING: ["Dyeing Operator"],
  COMPACTING: ["Compacting Operator"],
  "PRINT / EMBROIDERY": ["Embroidery Operator", "Embroidery Framer"],
  "OTHERS": ["Receptionist", "Driver", "Security Guard", "Fusing Operator", "Snap Button Operator", "Fusing Contractor", "Watchman", "Loadman", "Cook"]
};

export const STAFF_CLASSIFICATION = {
  "DEVELOPMENT": ["Technical Developer", "Frontend Developer", "Backend Developer", "Fullstack Developer"],
  "DESIGN": ["UI/UX Designer", "Graphic Designer"],
  "MARKETING": ["Digital Marketing", "SEO Specialist"],
  "IT SUPPORT": ["IT Support Engineer", "System Administrator"],
  MERCHANDISING: ["Merchandiser", "Junior Merchandiser", "Senior Merchandiser", "Sampling Merchandiser", "Merchandising Manager"],
  FABRIC: ["Fabric Follow-Up", "Fabric Incharge", "Fabric Manager", "Dyeing Followup", "Knitting Followup", "Lot Incharge", "Lot Assistant", "Dyeing Master", "Knitting Supervisor", "Knitting Incharge", "Knitting Manager", "Compacting Manager", "Dyeing Supervisor", "Dyeing Incharge", "Dyeing Manager"],
  "PRINT & EMBROIDERY": ["Print/Embroidery Followup", "Printing Followup", "Graphic Designer"],
  PRODUCTION: ["Cutting Incharge", "Cutting Manager", "Line Supervisor", "Production Incharge", "Production Manager", "Factory Manager", "Finishing Incharge", "Checking Incharge", "Ironing Incharge", "Packing Incharge", "Cutter Machine Operator", "Spreader Operator", "Feeding Incharge", "Industrial Engineer", "Cutting Supervisor"],
  QUALITY: ["Quality Manager", "Quality Controller", "Quality Executive", "Lab Incharge", "Lab Assistant", "Lab Technician", "Quality Incharge", "Line QC", "Fabric QC", "Knitting QC", "Finishing QC", "Dyeing Lab Manager", "Cutting QC", "AQL QC"],
  "HR & ADMIN": ["HR Manager", "HR Executive", "HR Assistant", "Admin Manager", "Admin Officer", "Recruitment Officer"],
  "ACCOUNTS & DOCS": ["Accounts cum Documentation Manager", "Accounts Manager", "Documentation Manager", "Documentation Incharge", "Accounts Assistant", "Accounts Executive"],
  "CAD & SAMPLING": ["CAD MASTER", "SAMPLING INCHARGE", "SAMPLE FOLLOWUP", "PATTERN MASTER", "DESIGNER", "Graphic Designer"],
  "ERP/EDP": ["ERP Manager", "ERP Incharge", "EDP Incharge", "Data Entry Operator"],
  STORE: ["Store Incharge", "Store Asst", "Store Keeper"],
  "OTHERS": ["DevOps Engineer", "Data Scientist", "Fresher", "Receptionist", "Mechanic", "Warden", "Electrician", "Cook", "Loadman", "ECOM Manager", "Graphic Designer"]
};

export const WORKER_CATEGORIES_BASE = [
  { name: "Sales & Biz Dev", id: "SALES & BIZ DEV", icon: "📈" },
  { name: "HR & Admin", id: "HR & ADMIN", icon: "📁" },
  { name: "Marketing", id: "MARKETING", icon: "📢" },
  { name: "Stitching", id: "STITCHING", icon: "✂️" },
  { name: "Cutting", id: "CUTTING", icon: "📐" },
  { name: "Checking", id: "CHECKING", icon: "✅" },
  { name: "Ironing & Packing", id: "IRONING & PACKING", icon: "🔥" },
  { name: "Knitting", id: "KNITTING", icon: "🧵" },
  { name: "Dyeing", id: "DYEING", icon: "🎨" },
  { name: "Compacting", id: "COMPACTING", icon: "🧺" },
  { name: "Print / Embroidery", id: "PRINT / EMBROIDERY", icon: "👕" },
  { name: "Others", id: "OTHERS", icon: "🛠️" }
];

export const STAFF_CATEGORIES_BASE = [
  { name: "Development", id: "DEVELOPMENT", icon: "💻" },
  { name: "Design", id: "DESIGN", icon: "🎨" },
  { name: "Marketing", id: "MARKETING", icon: "🚀" },
  { name: "IT Support", id: "IT SUPPORT", icon: "🖥️" },
  { name: "Merchandising", id: "MERCHANDISING", icon: "👔" },
  { name: "Fabric", id: "FABRIC", icon: "🧵" },
  { name: "Print & Embroidery", id: "PRINT & EMBROIDERY", icon: "🎨" },
  { name: "Production", id: "PRODUCTION", icon: "🏭" },
  { name: "Quality", id: "QUALITY", icon: "🔍" },
  { name: "HR & Admin", id: "HR & ADMIN", icon: "📁" },
  { name: "Accounts and Documentation", id: "ACCOUNTS & DOCS", icon: "📊" },
  { name: "CAD/Sampling", id: "CAD & SAMPLING", icon: "📐" },
  { name: "ERP/EDP", id: "ERP/EDP", icon: "💻" },
  { name: "Store", id: "STORE", icon: "📦" },
  { name: "Others", id: "OTHERS", icon: "🛠️" }
];

export const CLASSIFICATION = {
  "Technical": {
    departments: ["DEVELOPMENT", "DESIGN", "MARKETING", "IT SUPPORT", "MERCHANDISING", "FABRIC", "PRINT & EMBROIDERY", "PRODUCTION", "QUALITY", "HR & ADMIN", "ACCOUNTS & DOCS", "CAD & SAMPLING", "ERP/EDP", "STORE", "OTHERS"],
    designations: {
      DEVELOPMENT: ["Technical Developer", "Frontend Developer", "Backend Developer", "Fullstack Developer"],
      DESIGN: ["UI/UX Designer", "Graphic Designer"],
      MARKETING: ["Digital Marketing", "SEO Specialist"],
      "IT SUPPORT": ["IT Support Engineer", "System Administrator"],
      MERCHANDISING: ["Merchandiser", "Junior Merchandiser", "Senior Merchandiser", "Sampling Merchandiser", "Merchandising Manager"],
      FABRIC: ["Fabric Follow-Up", "Fabric Incharge", "Fabric Manager", "Dyeing Followup", "Knitting Followup", "Lot Incharge", "Lot Assistant", "Dyeing Master", "Knitting Supervisor", "Knitting Incharge", "Knitting Manager", "Compacting Manager", "Dyeing Supervisor", "Dyeing Incharge", "Dyeing Manager", "Trims Follow-Up"],
      "PRINT & EMBROIDERY": ["Print/Embroidery Followup", "Printing Followup", "Graphic Designer"],
      PRODUCTION: ["Cutting Incharge", "Cutting Manager", "Line Supervisor", "Production Incharge", "Production Manager", "Factory Manager", "Finishing Incharge", "Checking Incharge", "Ironing Incharge", "Packing Incharge", "Cutter Machine Operator", "Spreader Operator", "Feeding Incharge", "Industrial Engineer", "Cutting Supervisor"],
      QUALITY: ["Quality Manager", "Quality Controller", "Quality Executive", "Lab Incharge", "Lab Assistant", "Lab Technician", "Quality Incharge", "Line QC", "Fabric QC", "Knitting QC", "Finishing QC", "Dyeing Lab Manager", "Cutting QC", "AQL QC"],
      "HR & ADMIN": ["HR Manager", "HR Executive", "HR Assistant", "Admin Manager", "Admin Officer", "Recruitment Officer"],
      "ACCOUNTS & DOCS": ["Accounts cum Documentation Manager", "Accounts Manager", "Documentation Manager", "Documentation Incharge", "Accounts Assistant", "Accounts Executive"],
      "CAD & SAMPLING": ["CAD MASTER", "SAMPLING INCHARGE", "SAMPLE FOLLOWUP", "PATTERN MASTER", "DESIGNER", "Graphic Designer"],
      "ERP/EDP": ["ERP Manager", "ERP Incharge", "EDP Incharge", "Data Entry Operator"],
      STORE: ["Store Incharge", "Store Asst", "Store Keeper"],
      OTHERS: ["DevOps Engineer", "Data Scientist", "Fresher", "Receptionist", "Mechanic", "Warden", "Electrician", "Cook", "Loadman", "Others", "ECOM Manager"]
    }
  },
  "Non-Technical": {
    departments: ["SALES & BIZ DEV", "HR & ADMIN", "MARKETING", "CUTTING", "STITCHING", "CHECKING", "IRONING & PACKING", "KNITTING", "DYEING", "COMPACTING", "PRINT / EMBROIDERY", "OTHERS"],
    designations: {
      "SALES & BIZ DEV": ["Business Development Executive", "Sales Executive"],
      "HR & ADMIN": ["HR Manager", "Customer Support", "Operations Manager"],
      MARKETING: ["Marketing Executive", "Content Writer"],
      CUTTING: ["Cutting Master", "Cutting Helper", "Cutting Operator", "Spreader Operator", "Stickering Helper", "Cutting Contractor"],
      STITCHING: ["Overlock Tailor", "Flatlock Tailor", "Singer Tailor", "Multi Tailor", "Sample Tailor", "Sewing Helper", "Singer Contractor", "Powertable Contractor"],
      CHECKING: ["Trimmer", "Checker", "Sain Remove Operator", "Checking Contractor"],
      "IRONING & PACKING": ["Ironing Master", "Ironing Contractor", "Packer", "Packing Helper", "Packing Contractor", "Needle Detector Operator"],
      KNITTING: ["Knitting Foreman", "Knitting Operator"],
      DYEING: ["Dyeing Operator"],
      COMPACTING: ["Compacting Operator"],
      "PRINT / EMBROIDERY": ["Embroidery Operator", "Embroidery Framer", "Printing Master", "MHM Operator"],
      OTHERS: ["Fusing Operator", "Snap Button Operator", "Fusing Contractor", "Driver", "Security Guard", "Watchman", "Loadman", "Cook", "Others", "Receptionist"]
    }
  }
};
