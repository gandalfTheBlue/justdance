# Skill: Add a Just Dance Year Song List

## Purpose
Add every song of one Just Dance year (e.g. JD2024) as a new tab on the site.
Each song needs: title, Bilibili video link, in-game duration, and a cover image link from the Just Dance wiki.

**Never download images into the repo.** Covers are links to the wiki's image server
(`static.wikia.nocookie.net`). The repo used to hold ~360 MB of downloaded covers; they were all replaced with links.

## Steps at a glance

1. Get the song list + Bilibili links from Pxgggy's playlist for the year.
2. Get real durations from a full-game compilation video.
3. Cross-check the list against the wiki tracklist.
4. Write `src/data/songs-jd{year}.ts` with an empty `coverImage`.
5. Run `skills/wiki-covers.py` to fill in the cover links, then review its flagged rows.
6. Add the tab in `src/App.tsx`.
7. Verify: links load, build passes, every card shows an image in the browser.

All Bilibili requests need the header `Referer: https://www.bilibili.com`, or they are rejected.

---

## Step 1: Song list and links (Pxgggy playlist)

Pxgggy (Bilibili user id `525916725`) uploads one video per song, grouped into a playlist
("season") named `舞力全开{year} 全歌曲`, covering JD2014 to JD2026.

Find any one Pxgggy video for the year (web search `Pxgggy 舞力全开{year} 全歌曲 bilibili`), then read its playlist id:

```bash
curl -s 'https://api.bilibili.com/x/web-interface/view?bvid={any_bvid}' -H "Referer: https://www.bilibili.com" \
  | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print(d['owner']['mid'], d['season_id'])"
```

Pull the whole playlist in one call:

```bash
curl -s 'https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?mid={mid}&season_id={season_id}&sort_reverse=false&page_num=1&page_size=100' \
  -H "Referer: https://space.bilibili.com/{mid}" -H "User-Agent: Mozilla/5.0"
```

`data.archives[]` gives each song's `bvid` and `title`. Ignore its `duration` (see Step 2).

**Skip alternate routines.** A title with a full-width `（...）` suffix, e.g. `24K Magic（极限版本）`,
is an alternate dance (Extreme, Kids, etc.) of a song already in the list. Keep only the base song.
(Older years in the repo do include some alternates; new years should not.)

If Pxgggy has no playlist for the year, search Bilibili for `舞力全开{year} 全曲合集` and use another
creator's individual uploads (e.g. 天地无用8, user id `377304`, covers JD2019–JD2020).

## Step 2: Real durations (compilation video)

Pxgggy's videos include a 2–4 minute channel intro/outro, so their length is not the song length
(one JD2018 song: 477 s video vs 269 s song). Use a compilation video instead: one video whose
episode list has one song per episode. Search `舞力全开{year} 全曲合集` or `Just Dance {year} full song list`.

```bash
curl -s 'https://api.bilibili.com/x/player/pagelist?bvid={compilation_bvid}' -H "Referer: https://www.bilibili.com"
```

Each entry has `part` (song title) and `duration` (seconds). Format as `m:ss` with `f"{m}:{s:02d}"` from `divmod(seconds, 60)`.

Match songs by title, lowercased, punctuation removed (keep apostrophes):
- The compilation marks variants as suffixes: strip `(Alternate)`, ` Alternate`, and the triple-space
  tags `   Kids`, `   Double Rumble`, `   4 players`, `   Mobile`. Prefer the entry with no suffix.
- The two sources sometimes disagree on spelling (`ErroZ` vs `Error`) or on a subtitle
  (`The Way I Are` vs `The Way I Are (Dance With Somebody)`). Fix these with a small hand-written alias map.
- Songs added later (Just Dance+ songs) may be missing from the compilation. Estimate them as
  `video_duration - median_gap`, where `median_gap` is the median of (video − compilation) over the
  songs that did match. Treat these as approximate.

## Step 3: Cross-check against the wiki tracklist

Open `https://justdance.fandom.com/wiki/Just_Dance_{year}` (newer years: `Just_Dance_{year}_Edition`) and compare
its tracklist with your list. This catches songs from another year that were tagged with the wrong year in the playlist,
and songs the playlist is missing.

## Step 4: Write the data file

`src/data/songs-jd{year}.ts`, in the playlist's order:

```typescript
import type { Song } from "../types/Song";

export const jd{year}Songs: Song[] = [
  {
    id: "1",
    title: "Song Name - Artist",
    coverImage: "",
    bilibiliUrl: "https://www.bilibili.com/video/{bvid}",
    duration: "3:00",
    year: "{year}",
  },
];
```

- Export name `jd{year}Songs`; `id` counts from `"1"` within the file; `year` is a string.
- `title` is `Song - Artist`. Everything after ` - ` is ignored when looking up covers.
- `bilibiliUrl` is the single-song video, not the compilation.
- Keep each entry's `title` line directly followed by its `coverImage` line. The cover script relies on that.

## Step 5: Fill in cover links

Dry run first (prints one row per song, changes nothing), then add `--write` to save the links into the file:

```bash
python3 skills/wiki-covers.py src/data/songs-jd{year}.ts
python3 skills/wiki-covers.py src/data/songs-jd{year}.ts --write
```

For each song the script:
1. Looks up the wiki page named after the song (the title before ` - `, and before any Chinese variant label), following redirects.
2. If that page has no image (no such page, a wrong capitalization, or a "disambiguation" page listing several songs with the same name),
   it runs the wiki search. Among hits whose page name contains the song name (ignoring case, accents and punctuation), it takes the first
   whose image filename mentions this year (`jd2024_`/`jd24_`). If no hit's name matches (typos like `Just An Illustion`, Chinese-only titles), it falls back to the first hit with an image.
3. For a Chinese variant label (e.g. `极限版本`), it uses the variant's subpage, e.g. `Talk/Extreme Version`. The label→subpage table is `VARIANTS` in the script; add a row for a new label.
4. Writes the image as a 640px-wide thumbnail link (`.../revision/latest/scale-to-width-down/640`), about 50 KB instead of the 1–3 MB original.

Run against all 8 existing years, the script reproduces every one of the 475 hand-checked links with no overrides
(including tricky ones such as `Dynamite` → `Dynamite (BTS song)`, `Toxic` → `Toxic (Just Dance 2023 Edition)`, `我的新衣` → `My New Swag`).

**Still review every row marked `SEARCH` or `VARIANT-MISSING`.** A search hit can be a different song with the same name.
Fix a wrong one by naming the right wiki page and re-running (left side = song title before ` - `):

```bash
python3 skills/wiki-covers.py src/data/songs-jd{year}.ts --write "Jump=Jump (Major Lazer song)"
```

`VARIANT-MISSING` means the wiki has no separate page for that version (or the page just redirects to the base song);
the row keeps the base song's image. Example: `Level Up (VIP制作版本)`.

The script never makes up a link: a song whose `coverImage` is still `""` after `--write` had no match. Give it an override.

## Step 6: Add the tab in `src/App.tsx`

Add the year in four places, newest year first:

```typescript
import { jd2024Songs } from "./data/songs-jd2024";

type Tab = "2026" | "2024" | "2023" | ...;

const tabConfig: TabConfig[] = [
  { key: "2024", label: "Just Dance 2024", count: jd2024Songs.length },
];

const songMap: Record<Tab, Song[]> = {
  "2024": jd2024Songs,
};
```

`useState<Tab>("2026")` sets the tab shown first. Change it if the new year is the newest.

## Step 7: Verify

1. Every cover link loads when requested without a Referer:
   ```bash
   grep -o 'https://static.wikia[^"]*' src/data/songs-jd{year}.ts | xargs -P 16 -n 1 curl -s -o /dev/null -w '%{http_code}\n' | sort | uniq -c
   ```
   Expect only `200`. The count should equal the number of songs, minus any that share an image.
2. `pnpm build` passes.
3. Run `pnpm build && pnpm preview`, open the new tab in a browser, and check every card shows an image, e.g. in the console:
   `[...document.querySelectorAll('.song-card img')].filter(i => !i.naturalWidth).length` should be `0`.

## Pitfalls

1. **The wiki blocks images requested from other sites.** Its image server returns 404 when the browser says the request comes from another website (the `Referer` header).
   `SongCard.tsx` sets `referrerPolicy="no-referrer"` on the `<img>` for this. Do not remove it, and add it to any new component that shows covers.
2. **Wiki page names are case-sensitive after the first letter.** `Bad guy/Billie Version` does not exist; `Bad Guy/Billie Version` does.
   The script handles this by using the base page's real name (after redirects) to build variant subpage names.
3. **Do not link Bilibili cover images.** Bilibili's image server (`hdslb.com`) blocks other websites. Use wiki images.
4. **Bilibili search API is rate-limited** and often needs a login. The playlist API in Step 1 avoids it.
