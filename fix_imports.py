import os

page_path = r'd:\Job_Portal\src\app\admin\dashboard\page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_lines = f.readlines()

import_lines = page_lines[0:150] # Get all imports

manage_admins_path = r'd:\Job_Portal\src\components\admin\ManageAdminsTab.tsx'
with open(manage_admins_path, 'r', encoding='utf-8') as f:
    admin_lines = f.readlines()

# Find where 'export function ManageAdminsTab' starts
start_idx = -1
for i, line in enumerate(admin_lines):
    if line.startswith('export function ManageAdminsTab'):
        start_idx = i
        break

if start_idx != -1:
    new_admin_lines = import_lines + ['import { CLASSIFICATION } from "@/lib/constants";\n\n'] + admin_lines[start_idx:]
    with open(manage_admins_path, 'w', encoding='utf-8') as f:
        f.writelines(new_admin_lines)
    print('Successfully updated imports in ManageAdminsTab.tsx')
else:
    print('Could not find ManageAdminsTab export')
