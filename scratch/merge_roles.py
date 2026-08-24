import os

new_tech_deps = '["DEVELOPMENT", "DESIGN", "MARKETING", "IT SUPPORT", "MERCHANDISING", "FABRIC", "PRINT & EMBROIDERY", "PRODUCTION", "QUALITY", "HR & ADMIN", "ACCOUNTS & DOCS", "CAD & SAMPLING", "ERP/EDP", "STORE", "OTHERS"]'
old_tech_deps = '["MERCHANDISING", "FABRIC", "PRINT & EMBROIDERY", "PRODUCTION", "QUALITY", "HR & ADMIN", "ACCOUNTS & DOCS", "CAD & SAMPLING", "ERP/EDP", "STORE", "OTHERS"]'

new_nontech_deps = '["SALES & BIZ DEV", "HR & ADMIN", "MARKETING", "CUTTING", "STITCHING", "CHECKING", "IRONING & PACKING", "KNITTING", "DYEING", "COMPACTING", "PRINT / EMBROIDERY", "OTHERS"]'
old_nontech_deps = '["CUTTING", "STITCHING", "CHECKING", "IRONING & PACKING", "KNITTING", "DYEING", "COMPACTING", "PRINT / EMBROIDERY", "OTHERS"]'

designations_additions_tech = '''      DEVELOPMENT: ["Technical Developer", "Frontend Developer", "Backend Developer", "Fullstack Developer"],
      DESIGN: ["UI/UX Designer", "Graphic Designer"],
      MARKETING: ["Digital Marketing", "SEO Specialist"],
      "IT SUPPORT": ["IT Support Engineer", "System Administrator"],
      MERCHANDISING:'''

designations_additions_nontech = '''      "SALES & BIZ DEV": ["Business Development Executive", "Sales Executive"],
      "HR & ADMIN": ["HR Manager", "Customer Support", "Operations Manager"],
      MARKETING: ["Marketing Executive", "Content Writer"],
      CUTTING:'''


def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('departments: ' + old_tech_deps, 'departments: ' + new_tech_deps)
    new_content = new_content.replace('departments: ' + old_nontech_deps, 'departments: ' + new_nontech_deps)
    
    new_content = new_content.replace('MERCHANDISING: [', designations_additions_tech + ' [')
    new_content = new_content.replace('CUTTING: [', designations_additions_nontech + ' [')
    
    # replace OTHERS for Technical
    new_content = new_content.replace('OTHERS: ["Fresher"', 'OTHERS: ["DevOps Engineer", "Data Scientist", "Fresher"')
    
    # replace OTHERS for Non-Technical
    new_content = new_content.replace('OTHERS: ["Fusing Operator"', 'OTHERS: ["Fusing Operator", "Snap Button Operator", "Fusing Contractor", "Driver", "Security Guard", "Watchman", "Loadman", "Cook", "Others", "Receptionist"')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for root, dirs, files in os.walk('d:/Job_Portal/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            update_file(filepath)
