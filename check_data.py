import json
import re

with open('src/data/chunjamun.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

typo_patterns = [
    (r'빋날', '빛날'),
    (r'동녁', '동녘'),
    (r'서녁', '서녘'),
    (r'낫 ', '낯 '),
    (r'루를', '누를'),
    (r'딫', '빛'),
]

corrections = []

for d in data:
    # Check sound for 417 背
    if d['id'] == 417 and d['sound'] == '백':
        corrections.append(f"ID 417: 背 sound '백' -> '배'")
    
    # Check 749 duplicate
    if d['id'] == 749 and d['hanja'] == '戚':
        corrections.append(f"ID 749: 戚 -> 慼 (Variant/Grief)")

    # Check for general typos in meaning
    for pat, repl in typo_patterns:
        if re.search(pat, d['meaning']):
            corrections.append(f"ID {d['id']}: {d['hanja']} meaning '{d['meaning']}' -> contains '{pat}' (fix to '{repl}')")

# Check for duplicates
hanjas = [d['hanja'] for d in data]
for h in set(hanjas):
    if hanjas.count(h) > 1:
        ids = [d['id'] for d in data if d['hanja'] == h]
        corrections.append(f"Duplicate Hanja '{h}' at IDs: {ids}")

for c in corrections:
    print(c)
