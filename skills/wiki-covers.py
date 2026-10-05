import json, re, sys, time, unicodedata, urllib.parse, urllib.request

API = "https://justdance.fandom.com/api.php"
VARIANTS = [("极限", "Extreme Version"), ("Billie 版本", "Billie Version"), ("女神", "Goddess Version"),
            ("排舞", "Line Dance Version"), ("蛇", "Snake Version"), ("洞穴人", "Caveman Version"),
            ("VIP制作", "VIPMADE"), ("美味", "Yummy Version"), ("童话", "Fairy Version"), ("桑巴", "Samba Version"),
            ("午夜", "Night Version"), ("现代舞", "Contemporary Dance Version"), ("DJ版本", "DJ Version"),
            ("特别版歌曲", "Alternate Version"), ("官方编舞", "Official Choreo"), ("豪车", "Limo Version")]


def api(**params):
    params.update(format="json")
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": "Mozilla/5.0"})
    time.sleep(0.2)
    return json.load(urllib.request.urlopen(req))["query"]


def page_image(title):
    q = api(action="query", titles=title, prop="pageimages", piprop="original", redirects=1)
    page = next(iter(q["pages"].values()))
    return page["title"], page.get("original", {}).get("source")


def simple(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text).lower() if c.isalnum())


def search_image(text, year):
    q = api(action="query", generator="search", gsrsearch=text, gsrlimit=5, prop="pageimages", piprop="original")
    hits = [p for p in sorted(q.get("pages", {}).values(), key=lambda p: p["index"]) if p.get("original")]
    related = [p for p in hits if simple(text) in simple(p["title"].split("/")[-1]) or simple(p["title"].split("/")[-1]) in simple(text)] or hits
    same_year = [p for p in related if re.search(rf"jd({year}|{year[2:]})_", p["original"]["source"], re.I)]
    best = (same_year or related or [None])[0]
    return (best["title"], best["original"]["source"]) if best else (None, None)


def base_title(title):
    t = re.sub(r"\s+-\s+.*$", "", title)
    t = re.sub(r"\s*[（(][^)）]*[一-鿿][^)）]*[)）]", "", t)
    return re.sub(r"-[^-]*[一-鿿].*$", "", t).strip()


def thumb(url):
    return url.split("/revision/")[0] + "/revision/latest/scale-to-width-down/640"


def main(path, write, overrides):
    src = open(path).read()
    year = re.search(r"jd(\d{4})", path).group(1)
    for title, old in re.findall(r'title: "(.*?)",\s*coverImage: "(.*?)"', src):
        base = base_title(title)
        page, url = page_image(overrides.get(base, base))
        how = "page"
        if not url:
            page, url = search_image(base, year)
            how = "SEARCH"
        variant = next((v for k, v in VARIANTS if k in title), None)
        if variant and page:
            alt_page, alt_url = page_image(page + "/" + variant)
            page, url, how = (alt_page, alt_url, how + "+variant") if alt_url and alt_page != page else (page, url, "VARIANT-MISSING")
        print(f"{how:16} {title}  ->  {page}  |  {url and url.split('/images/')[1].split('/revision')[0]}")
        if url:
            src = src.replace(f'title: "{title}",\n    coverImage: "{old}"', f'title: "{title}",\n    coverImage: "{thumb(url)}"')
    if write:
        open(path, "w").write(src)


if __name__ == "__main__":
    args = sys.argv[1:]
    overrides = dict(a.split("=", 1) for a in args if "=" in a)
    main(next(a for a in args if a.endswith(".ts")), "--write" in args, overrides)
