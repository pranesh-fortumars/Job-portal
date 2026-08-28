import os

page_path = r'd:\Job_Portal\src\app\admin\dashboard\page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

if 'const safeFormatDateOnly =' not in page_content:
    with open(page_path, 'a', encoding='utf-8') as f:
        f.write('''
const safeFormatDateOnly = (dateVal: any) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    const { isValid, format } = require('date-fns');
    return isValid(d) ? format(d, "dd MMM yyyy") : "N/A";
  } catch {
    return "N/A";
  }
};
''')

branding_path = r'd:\Job_Portal\src\components\admin\BrandingHubTab.tsx'
with open(branding_path, 'r', encoding='utf-8') as f:
    branding_content = f.read()

if 'const LOGO_SECTIONS = [' not in branding_content:
    logo_sections = '''
const LOGO_SECTIONS = [
  { id: 'header', name: 'Home Page & Header', description: 'Primary brand identity visible across all public navigation bars.' },
  { id: 'auth', name: 'Auth Terminal (Login/Signup)', description: 'Branding used on the Login and Registration screens.' },
  { id: 'dashboard', name: 'User Dashboards', description: 'Logo displayed in the Seeker and Employer dashboards.' },
  { id: 'admin', name: 'Admin Dashboard', description: 'Branding for the internal administrative management suite.' },
  { id: 'splash', name: 'Loading Splash Screen', description: 'The animated logo shown during initial application load.' },
  { id: 'pdf', name: 'Digital Resume & PDF', description: 'High-resolution logo for generated professional dossiers.' },
  { id: 'footer', name: 'Site Footer', description: 'Branding visible at the bottom of all application pages.' },
  { id: 'corp_badge', name: 'Corporate Legitimacy Badge', description: 'The logo displayed in the verified MSME/GST section at the bottom of the home page.' }
];
'''
    with open(branding_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, l in enumerate(lines):
        if 'export function BrandingHubTab' in l:
            lines.insert(i, logo_sections)
            break
            
    with open(branding_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

print('Fixed helper functions and constants')
