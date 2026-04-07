import { useEffect } from "react";
import * as AssetMaps from "./AssetMaps.js";
import { preloadImages } from "./AssetCache.js";

// Core sounds used frequently in the UI; these are relative to the public folder
const SOUND_PATHS = [
  "/sounds/music/intro.mp3",
  "/sounds/music/question.mp3",
  "/sounds/effects/click.mp3",
  "/sounds/effects/correct.mp3",
  "/sounds/effects/incorrect.mp3",
];

const collectUrls = (value, out = []) => {
  if (!value) {
    return out;
  }

  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectUrls(v, out));
    return out;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((v) => collectUrls(v, out));
  }
  return out;
};

const Preloader = () => {
  useEffect(() => {
    // gather asset URLs from AssetMaps
    const urls = [];
    Object.values(AssetMaps).forEach((v) => collectUrls(v, urls));

    // preload images
    preloadImages(urls).catch(() => {});

    // preload common sounds
    try {
      SOUND_PATHS.forEach((p) => {
        try {
          const a = new Audio();
          a.preload = "auto";
          a.src = p;
          a.load();
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {}
  }, []);

  return null;
};

export default Preloader;
