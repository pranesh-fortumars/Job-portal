import os
import re

files_to_update = [
    'd:/Job_Portal/src/app/seeker/profile/page.tsx',
    'd:/Job_Portal/src/app/seeker/onboarding/page.tsx',
    'd:/Job_Portal/src/app/employer/post-job/page.tsx',
    'd:/Job_Portal/src/app/jobs/page.tsx',
    'd:/Job_Portal/src/app/admin/dashboard/page.tsx'
]

import_statement = 'import { CLASSIFICATION } from "@/lib/constants";\n'

for filepath in files_to_update:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex to find `const CLASSIFICATION = { ... };` block
        # It handles nested braces by simply matching until the end of the block.
        # Given the structure, we can match from `const CLASSIFICATION = {` up to `};`
        # Since it's a large block, let's use a robust pattern.
        pattern = re.compile(r'const\s+CLASSIFICATION\s*=\s*\{.*?\n\s*\};\n', re.DOTALL)
        
        if pattern.search(content):
            new_content = pattern.sub('', content)
            
            # Find the last import statement to insert the new import after it
            imports_end = new_content.rfind('import ')
            if imports_end != -1:
                newline_after_import = new_content.find('\n', imports_end)
                if newline_after_import != -1:
                    new_content = new_content[:newline_after_import+1] + import_statement + new_content[newline_after_import+1:]
                else:
                    new_content = import_statement + new_content
            else:
                new_content = import_statement + new_content
                
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Successfully updated {filepath}')
        else:
            print(f'No match found in {filepath}')
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
