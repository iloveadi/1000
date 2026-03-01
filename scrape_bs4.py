import urllib.request
from bs4 import BeautifulSoup
import json
import re

url = "https://ko.wikisource.org/wiki/%EC%B2%9C%EC%9E%90%EB%AC%B8"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
    soup = BeautifulSoup(html, 'lxml')
    
    tables = soup.find_all('table')
    print("Found", len(tables), "tables")
    
    result = []
    char_id = 1
    
    # Usually the first large table is the thousand characters
    for table in tables:
        tds = table.find_all('td')
        if len(tds) < 100:
            continue
            
        for td in tds:
            # Inside td, there might be <a> (hanja) and text (meaning)
            # Find the hanja
            a_tag = td.find('a')
            if not a_tag:
                # Some hanja might not be in an a tag, but let's check text
                text_content = td.get_text(separator='|', strip=True)
            else:
                text_content = td.get_text(separator='|', strip=True)
            
            # Text content should look like "天|하늘 천" or "天|하늘|천"
            parts = [p.strip() for p in text_content.split('|') if p.strip()]
            
            # The first part should be a single character 
            if len(parts) >= 2 and len(parts[0]) == 1:
                hanja = parts[0]
                # The remainder is meaning + sound, e.g., ["하늘", "천"] or ["하늘 천"]
                meaning_sound = " ".join(parts[1:])
                # Clean up if there are any references [1]
                meaning_sound = re.sub(r'\[\d+\]', '', meaning_sound).strip()
                
                # Split meaning_sound to extract the last word as 'sound'
                words = meaning_sound.split()
                if len(words) >= 2:
                    sound = words[-1]
                else:
                    sound = meaning_sound
                    
                result.append({
                    "id": char_id,
                    "hanja": hanja,
                    "meaning": meaning_sound,
                    "sound": sound
                })
                char_id += 1
                
        if len(result) >= 900:  # Valid table found
            break

    print("Extracted", len(result), "characters")
    if len(result) > 0:
        print("Sample:", result[0], result[-1])
        with open('src/data/chunjamun.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print("Saved to src/data/chunjamun.json")
except Exception as e:
    print("Failed to scrape:", e)
