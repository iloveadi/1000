import urllib.request
import re
import json

def fetch_chunjamun():
    url = "https://ko.wikisource.org/wiki/%EC%B2%9C%EC%9E%90%EB%AC%B8"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # The structure is standard Wiki markup rendered:
            # <td><a href="..." title="...">天</a><br />하늘 천</td>
            # Let's extract them
            pattern = re.compile(r'<td[^>]*><a[^>]*>([一-龥])</a>[^<]*<br[^>]*>\s*([^\s<]+)\s*([^\s<]+)</td>')
            
            matches = pattern.findall(html)
            
            if not matches:
                # Alternate pattern
                pattern2 = re.compile(r'<a[^>]*title="[^"]+">([一-龥])</a>.*?<br />\s*([^<]+)', re.S)
                matches2 = pattern2.findall(html)
                print("Fallback pattern found:", len(matches2))
                return
            
            print("Found characters:", len(matches))
            
            result = []
            for i, match in enumerate(matches):
                hanja, meaning, sound = match
                result.append({
                    "id": i + 1,
                    "hanja": hanja,
                    "meaning": meaning + " " + sound,
                    "sound": sound
                })
            
            with open("chunjamun_raw.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=4)
            print("Successfully saved to chunjamun_raw.json")
            
    except Exception as e:
        print("Failed to fetch:", e)

if __name__ == "__main__":
    fetch_chunjamun()
