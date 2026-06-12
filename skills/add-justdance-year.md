# Skill: Add a Just Dance Year Song List

## Purpose
Add a complete song list for a specific Just Dance year (e.g., JD2021, JD2022) to this site.
Creates the data file, downloads cover images, and integrates into the year-grouped landing page.

## Prerequisites
- Node.js / pnpm project (already set up)
- curl available
- Python 3 available

---

## Step 1: Find a Compilation Video on Bilibili

Search Bilibili for a full-song compilation for the target year:

- Chinese: `舞力全开{year} 全曲合集`
- English: `Just Dance {year} full song list`

Look for videos with a **视频选集** (episode list) section. Each episode = one song.
Note the BV number (e.g., `BV1Je4y1x78Q` for JD2020).

## Step 2: Extract Song List via Bilibili API

```bash
curl -s 'https://api.bilibili.com/x/player/pagelist?bvid={BV}' | python3 -c "
import json, sys
data = json.load(sys.stdin)['data']
for p in data:
    print(json.dumps({
        'page': p['page'],
        'part': p['part'],
        'duration': p['duration'],
        'first_frame': p.get('first_frame', ''),
    }, ensure_ascii=False))
" > /tmp/jd{year}_pages.json
```

This gives: page number, song title (Chinese/English mixed), duration in seconds, and first-frame URL.

**API note**: `duration` is in seconds. Convert to `m:ss` format:
```python
m, s = divmod(duration_seconds, 60)
f"{m}:{s:02d}"
```

## Step 3: Find Individual Videos with Good Cover Images

The compilation's `first_frame` images are often unclear (black frames, loading screens).
Find **individual uploads** from known Just Dance creators instead.

### Known Bilibili Creators (search these first):

| Creator | Space ID | Style | Coverage |
|---------|----------|-------|----------|
| Pxgggy | 525916725 | NOHUD, 1080p, individual song per video | JD2014–JD2026 |
| 天地无用8 | 377304 | Individual songs, early uploads | JD2019–JD2020 |

### Find Individual Videos:

**Method A - Pxgggy playlist** (preferred if available):
Pxgggy creates playlists named `舞力全开{year} 全歌曲`. Access via:
```
https://api.bilibili.com/x/web-interface/view?bvid={any_pxgggy_video_bvid}
```
Then find the playlist/season data.

**Method B - Search API** (rate limited, may need auth):
```
https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=just+dance+{year}+{song_name}
```

**Method C - Web search** (fallback):
Search for `just dance {year} {song_name} site:bilibili.com` and extract BV numbers.

**Method D - Librarian agent** (recommended for bulk):
Delegate to the librarian agent with all song names and creator space IDs.

### Get Cover Image URL for Each BV:

```bash
curl -s 'https://api.bilibili.com/x/web-interface/view?bvid={BV}' | python3 -c "
import json, sys
print(json.load(sys.stdin)['data']['pic'])
"
```

The `pic` field is the uploader-chosen cover — much clearer than `first_frame`.

## Step 4: Download Cover Images

Save to `public/covers/jd{year}/`:

```bash
mkdir -p public/covers/jd{year}

# For each song's pic URL:
curl -sL -o "public/covers/jd{year}/individual-{NN}.jpg" \
  -H "Referer: https://www.bilibili.com" \
  "{pic_url}"
```

**CRITICAL**: The `Referer` header is required — Bilibili CDN blocks requests without it.

Naming convention: `individual-01.jpg` through `individual-NN.jpg`, ordered by the compilation's page order.

### Check for Duplicates with Existing Covers:

If songs from `src/images/` (old imports) overlap with the new JD covers, keep the Pxggjy covers (smaller, more consistent) and remove the old PNGs:

```bash
# Compare sizes
ls -lhS src/images/
ls -lh public/covers/jd{year}/

# Remove duplicates, move unique files to public/covers/
rm src/images/{duplicate}.png
mv src/images/{unique}.png public/covers/{unique}.png
```

## Step 5: Create the Data File

Create `src/data/songs-jd{year}.ts`:

```typescript
import type { Song } from "../types/Song";

export const jd{year}Songs: Song[] = [
  {
    id: "1",
    title: "Song Name",
    coverImage: "/covers/jd{year}/individual-01.jpg",
    bilibiliUrl: "https://www.bilibili.com/video/{BV}",
    duration: "3:00",
    year: "{year}",
  },
  // ... all songs
];
```

**Conventions**:
- Export name: `jd{year}Songs` (e.g., `jd2020Songs`, `jd2021Songs`)
- Cover path: `/covers/jd{year}/individual-{NN}.jpg`
- ID: sequential starting from `"1"` within the file
- `year` field: the Just Dance year as string (e.g., `"2020"`, `"2021"`)
- `duration`: `m:ss` format
- `bilibiliUrl`: individual video URL, not compilation URL
- No image imports — use path strings only

## Step 6: Wire Up in App.tsx

The landing page auto-groups by year. Just add the import and combine:

```typescript
import { jd2020Songs } from "./data/songs-jd2020";
import { jd2021Songs } from "./data/songs-jd2021";
import { songs } from "./data/songs";

// In the App component:
const allSongs = [...jd2020Songs, ...jd2021Songs, ...songs];
const grouped = groupByYear(allSongs);
```

## Step 7: Verify

```bash
pnpm build
```

All covers should appear in `dist/covers/jd{year}/`.

---

## File Structure Reference

```
public/covers/
├── jd2020/
│   ├── individual-01.jpg ... individual-54.jpg
├── jd2021/                        # ← new year goes here
│   ├── individual-01.jpg ...
├── fire.png                       # other/uncategorized
├── space-astronaut.png
└── freezy-please.jpg

src/data/
├── songs.ts                       # other/uncategorized songs
├── songs-jd2020.ts                # JD2020 songs
└── songs-jd{year}.ts              # ← new year file

src/types/
└── Song.ts                        # Song interface (has optional year field)

src/
└── App.tsx                        # imports all, groups by year
```

## Key Bilibili API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `api.bilibili.com/x/player/pagelist?bvid={BV}` | Get episode list (titles, durations) |
| `api.bilibili.com/x/web-interface/view?bvid={BV}` | Get video info (cover `pic`, title) |
| `api.bilibili.com/x/player/playurl?bvid={BV}&cid={cid}` | Get video stream URL |
| `api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={query}` | Search videos |

All require `Referer: https://www.bilibili.com` header.

## Song Type

```typescript
// src/types/Song.ts
export interface Song {
  id: string;
  title: string;
  coverImage: string;   // path in /covers/ or /covers/jd{year}/
  bilibiliUrl: string;  // individual video URL
  duration: string;     // "m:ss"
  year?: string;        // e.g., "2020", "2021" — absent = "Other"
}
```

## Common Pitfalls

1. **Cover hotlink blocking**: Bilibili CDN (`hdslb.com`) blocks requests without `Referer: https://www.bilibili.com`. Always download covers locally — never link to hdslb.com directly.
2. **API rate limiting**: The search API may return empty responses if called too fast. Add `time.sleep(0.5)` between calls.
3. **First frame vs cover**: The `first_frame` from pagelist API is often a black/loading screen. Always use `pic` from individual video view API instead.
4. **http vs https**: Bilibili API returns `http://` URLs. Convert to `https://` for download, or curl follows redirects automatically.
5. **Duration source**: Use the compilation's `pagelist` durations (game-accurate), not individual video durations (may include intros/outros).
6. **Deduplication**: If `src/images/` has PNGs for songs also in the new JD year, prefer the Pxgggy `individual-*.jpg` covers (smaller, game-accurate frames).
