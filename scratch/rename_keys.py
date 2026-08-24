import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

replacements = {
    "Staff: {": "\"Technical\": {",
    "Worker: {": "\"Non-Technical\": {",
    "Staff: ": "\"Technical\": ",
    "Worker: ": "\"Non-Technical\": "
}

for root, dirs, files in os.walk('d:/Job_Portal/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            replace_in_file(filepath, replacements)
