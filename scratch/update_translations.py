import os
import re

new_departments = '''
      "SALES & BIZ DEV": "Sales & Business Development",
      "DEVELOPMENT": "Development",
      "DESIGN": "Design",
      "MARKETING": "Marketing",
      "IT SUPPORT": "IT Support",
'''

new_designations = '''
      "Business Development Executive": "Business Development Executive",
      "Sales Executive": "Sales Executive",
      "Technical Developer": "Technical Developer",
      "Frontend Developer": "Frontend Developer",
      "Backend Developer": "Backend Developer",
      "Fullstack Developer": "Fullstack Developer",
      "UI/UX Designer": "UI/UX Designer",
      "Digital Marketing": "Digital Marketing",
      "SEO Specialist": "SEO Specialist",
      "IT Support Engineer": "IT Support Engineer",
      "System Administrator": "System Administrator",
      "DevOps Engineer": "DevOps Engineer",
      "Data Scientist": "Data Scientist",
      "Operations Manager": "Operations Manager",
      "Customer Support": "Customer Support",
      "Marketing Executive": "Marketing Executive",
      "Content Writer": "Content Writer",
'''

def update_translations(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to insert the new_departments at the beginning of the departments object
    # The pattern is: departments: {
    content = content.replace('departments: {', 'departments: {' + new_departments)
    content = content.replace('designations: {', 'designations: {' + new_designations)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {filepath}')

update_translations('d:/Job_Portal/src/lib/translations.ts')
