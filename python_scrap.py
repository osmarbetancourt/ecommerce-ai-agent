import csv
import requests
import time
import re
import json

BRANDS = [
    # ... (same as before)
    'david', 'ferrara', 'st michel', 'la grande galette', 'mary macleod', 'the cake bake shop', 'classic cake',
    # (etc, omitted for brevity)
]

CATEGORY_KEYWORDS = [
    # ... (same as before)
    ('cake', ['cake', 'cheesecake', 'brownie', 'galette', 'torte', 'fudge', 'pie', 'truffle', 'tiramisu', 'entremet', 'panettone']),
    ('cookie', ['cookie', 'cookies', 'shortbread', 'biscuit', 'madeleine', 'cannoli']),
    # (etc, omitted for brevity)
]

def clean_product_name(name, max_length=80):
    # ... (same as before)
    name = name.lower()
    name = re.sub(r"[’']s\b", "", name)
    for brand in BRANDS:
        name = re.sub(rf"\b{re.escape(brand)}\b", "", name)
    name = re.sub(r"\d+(\.\d+)?\s*([lb|lbs|oz|g|qt|fl oz|count|pack|pieces?|servings?|bottles?|bags?|slices?|cans?|boxes?|gallon|tin|tray|case|each]+)", "", name)
    name = re.sub(r"\d+\s*-\s*\w+", "", name)
    name = re.sub(r"\(.*?\)", "", name)
    name = re.sub(r"\d+", "", name)
    name = re.sub(r"[,\.]", "", name)
    name = re.sub(r"\s+", " ", name)
    cleaned = name.strip()
    return cleaned[:max_length]

def get_fallback_category(name):
    name_low = name.lower()
    for category, keywords in CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in name_low:
                return category
    return "food"  # Default generic fallback

def pixabay_image_search(query, api_key, per_page=3, retries=3):
    url = "https://pixabay.com/api/"
    params = {
        "key": api_key,
        "q": query,
        "image_type": "photo",
        "per_page": per_page
    }
    for attempt in range(retries):
        try:
            res = requests.get(url, params=params, timeout=10)
            try:
                data = res.json()
            except Exception as json_err:
                print(f"Non-JSON response for '{query}':\n{res.text}\n")
                return None
            images = [img['largeImageURL'] for img in data.get('hits', [])]
            return images[0] if images else None
        except Exception as e:
            print(f"Error searching '{query}' (attempt {attempt+1}/{retries}): {e}")
            time.sleep(1)
    return None

input_csv = 'groceries.csv'
output_jsonl = 'groceries_with_images.jsonl'
api_key = '51367246-ff33e52d0ec9111dd0f1f70e9'

with open(input_csv, newline='', encoding='utf-8') as infile, \
     open(output_jsonl, 'w', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    for idx, row in enumerate(reader, 1):
        title = row.get('Title', '')
        search_query = clean_product_name(title)
        url = pixabay_image_search(search_query, api_key)
        if not url:
            fallback_query = get_fallback_category(title)
            url = pixabay_image_search(fallback_query, api_key)
            print(f"[{idx}] Fallback search for '{title}' with '{fallback_query}' yielded: {url}")
        else:
            print(f"[{idx}] Direct search for '{title}' with '{search_query}' yielded: {url}")
        row['image_url'] = url if url else ''
        outfile.write(json.dumps(row, ensure_ascii=False) + '\n')
        outfile.flush()   # Ensures line is written to disk immediately
        time.sleep(0.7)

print("Done! Output written to:", output_jsonl)