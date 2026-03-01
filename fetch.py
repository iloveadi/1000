import urllib.request
import json
import os
import sys

def main():
    url = "https://api.github.com/search/code?q=천자문+extension:json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            for item in data.get('items', [])[:5]:
                repo = item['repository']['full_name']
                path = item['path']
                raw_url = f"https://raw.githubusercontent.com/{repo}/main/{path}"
                raw_url2 = f"https://raw.githubusercontent.com/{repo}/master/{path}"
                
                for u in [raw_url, raw_url2]:
                    try:
                        print('Trying:', u)
                        res = urllib.request.urlopen(u)
                        content = res.read().decode('utf-8')
                        if len(content) > 1000:
                            with open('chunjamun_test.json', 'w', encoding='utf-8') as f:
                                f.write(content)
                            print(f"Success! Downloaded {len(content)} bytes from {u}")
                            sys.exit(0)
                    except Exception as e:
                        print('  Failed:', e)
    except Exception as e:
        print('Search Failed:', e)

if __name__ == "__main__":
    main()
