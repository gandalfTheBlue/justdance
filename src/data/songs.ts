import badGuyImage from "../images/bad-guy.png";
import fireImage from "../images/fire.png";
import killThisLoveImage from "../images/kill-this-love.png";
import spaceAstronautImage from "../images/space-astronaut.png";
import stopMovingImage from "../images/stop-moving.png";
import sushiImage from "../images/sushi.png";
import type { Song } from "../types/Song";

export const songs: Song[] = [
  {
    id: "1",
    title: "Stop Movin'",
    coverImage: stopMovingImage,
    bilibiliUrl:
      "https://www.bilibili.com/video/BV1ttvMeJEKd/?spm_id_from=333.337.search-card.all.click&vd_source=374acb348bd1a6975c7c63068165b29e",
    duration: "3:08",
  },
  {
    id: "2",
    title: "Fire",
    coverImage: fireImage,
    bilibiliUrl:
      "https://www.bilibili.com/video/BV1BX4y1b7zd/?spm_id_from=333.337.search-card.all.click&vd_source=374acb348bd1a6975c7c63068165b29e",
    duration: "3:49",
  },
  {
    id: "3",
    title: "Kill this love",
    coverImage: killThisLoveImage,
    bilibiliUrl:
      "https://www.bilibili.com/video/BV11E411G7uH/?spm_id_from=333.337.search-card.all.click",
    duration: "3:33",
  },
  {
    id: "4",
    title: "Bad guy",
    coverImage: badGuyImage,
    bilibiliUrl:
      "https://www.bilibili.com/video/BV14E411q7J4/?spm_id_from=333.337.search-card.all.click",
    duration: "3:47",
  },
  {
    id: "5",
    title: "Sushi",
    coverImage: sushiImage,
    bilibiliUrl:
      "https://www.bilibili.com/video/BV1tE411q7Nf/?spm_id_from=333.337.search-card.all.click",
    duration: "3:47",
  },
  {
    id: "6",
    title: "Space Astronaut",
    coverImage: spaceAstronautImage,
    bilibiliUrl: "https://www.bilibili.com/video/BV1MEV668EYo/",
    duration: "2:05",
  },
];
