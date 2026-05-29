import re

with open('d:/IDEA/Projekt/blitzersafe_lp/index.html', encoding='utf-8') as f:
    html = f.read()

de_vals = re.findall(r'data-de="([^"]+)"', html)
en_vals = re.findall(r'data-en="([^"]+)"', html)

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
print(f'DE: {len(de_vals)}, EN: {len(en_vals)}')
for i, (d, e) in enumerate(zip(de_vals, en_vals)):
    print(f'--- {i+1} ---')
    print(f'DE: {d}')
    print(f'EN: {e}')
