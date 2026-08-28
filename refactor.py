import os

page_path = r'd:\Job_Portal\src\app\admin\dashboard\page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Get imports for the new files
import_lines = lines[0:149]

# Define ranges
branding_hub_lines = lines[323:631]
designation_registry_lines = lines[631:1050]
department_asset_manager_lines = lines[1050:1370]

# Create BrandingHubTab.tsx
with open(r'd:\Job_Portal\src\components\admin\BrandingHubTab.tsx', 'w', encoding='utf-8') as f:
    f.writelines(import_lines)
    f.write('export ' + "".join(branding_hub_lines).replace('function BrandingHub', 'function BrandingHubTab'))

# Create DesignationRegistryTab.tsx
with open(r'd:\Job_Portal\src\components\admin\DesignationRegistryTab.tsx', 'w', encoding='utf-8') as f:
    f.writelines(import_lines)
    f.write('export ' + "".join(designation_registry_lines).replace('function DesignationRegistry', 'function DesignationRegistryTab'))

# Create DepartmentAssetManagerTab.tsx
with open(r'd:\Job_Portal\src\components\admin\DepartmentAssetManagerTab.tsx', 'w', encoding='utf-8') as f:
    f.writelines(import_lines)
    f.write('export ' + "".join(department_asset_manager_lines).replace('function DepartmentAssetManager', 'function DepartmentAssetManagerTab'))

# Delete the extracted components from page.tsx (reverse order to maintain indices)
del lines[1050:1370]
del lines[631:1050]
del lines[323:631]

# Insert imports for the new components
import_idx = -1
for i, l in enumerate(lines):
    if l.startswith('import { ManageAdminsTab }'):
        import_idx = i
        break

if import_idx != -1:
    lines.insert(import_idx + 1, 'import { ErrorBoundary } from "@/components/ui/ErrorBoundary";\n')
    lines.insert(import_idx + 2, 'import { BrandingHubTab } from "@/components/admin/BrandingHubTab";\n')
    lines.insert(import_idx + 3, 'import { DesignationRegistryTab } from "@/components/admin/DesignationRegistryTab";\n')
    lines.insert(import_idx + 4, 'import { DepartmentAssetManagerTab } from "@/components/admin/DepartmentAssetManagerTab";\n')

# Wrap tabs with ErrorBoundary and replace old component calls
new_lines = "".join(lines)
new_lines = new_lines.replace('<BrandingHub db={db} />', '<ErrorBoundary><BrandingHubTab db={db} /></ErrorBoundary>')
new_lines = new_lines.replace('<DesignationRegistry db={db} />', '<ErrorBoundary><DesignationRegistryTab db={db} /></ErrorBoundary>')
new_lines = new_lines.replace('<DepartmentAssetManager db={db} />', '<ErrorBoundary><DepartmentAssetManagerTab db={db} /></ErrorBoundary>')

# Also wrap Profile and AdminMgmt for consistency!
new_lines = new_lines.replace('<ProfileTab db={db} profile={userProfile} />', '<ErrorBoundary><ProfileTab db={db} profile={userProfile} /></ErrorBoundary>')
new_lines = new_lines.replace('<ManageAdminsTab db={db} liveUsers={liveUsers} />', '<ErrorBoundary><ManageAdminsTab db={db} liveUsers={liveUsers} /></ErrorBoundary>')
new_lines = new_lines.replace('<HeroSliderManager db={db} />', '<ErrorBoundary><HeroSliderManager db={db} /></ErrorBoundary>')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(new_lines)

print('Refactoring complete.')
