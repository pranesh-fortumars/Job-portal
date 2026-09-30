import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace('NexTirupur', 'NexIndia')
        new_content = new_content.replace('nextirupur', 'nexindia')
        new_content = new_content.replace('Tirupur', 'India')
        new_content = new_content.replace('tirupur', 'india')
        new_content = new_content.replace('TIRUPUR', 'INDIA')

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    changed_files = 0
    src_dir = os.path.join('d:\\', 'Job_Portal', 'src')
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.json', '.md')):
                filepath = os.path.join(root, file)
                if replace_in_file(filepath):
                    changed_files += 1
                    print(f"Updated {filepath}")
                    
    print(f"Total files updated: {changed_files}")

if __name__ == '__main__':
    main()
