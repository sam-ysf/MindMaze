const cache = new Map();

export function getImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
        return resolve(null);
    }

    const existing = cache.get(url);
    if (existing) {
      if (existing.complete) {
        return resolve(existing);
      }
      existing.addEventListener(
        "load",
        function onLoad() {
          existing.removeEventListener("load", onLoad);
          resolve(existing);
        },
        { once: true },
      );
      existing.addEventListener(
        "error",
        function onErr(e) {
          existing.removeEventListener("error", onErr);
          reject(e || new Error("Image failed to load"));
        },
        { once: true },
      );
      return;
    }

    const image = new Image();
    image.src = url;
    image.addEventListener(
      "load",
      () => {
        cache.set(url, image);
        resolve(image);
      },
      { once: true },
    );
    image.addEventListener(
      "error",
      (e) => {
        reject(e || new Error("Image failed to load"));
      },
      { once: true },
    );

    // store early so concurrent requests reuse the same element
    cache.set(url, image);
  });
}

export function preloadImages(urls) {
  const unique = Array.from(new Set((urls || []).filter(Boolean)));
  return Promise.all(unique.map((u) => getImage(u).catch(() => null)));
}

export default { getImage, preloadImages };
