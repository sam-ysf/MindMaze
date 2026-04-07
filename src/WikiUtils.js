// Opens Wikipedia link in new window
export const goToWiki = (page, e = null) => {
  window.open(`https://wikipedia.org/wiki/${page}`, "_blank");
  if (e) {
    e.preventDefault();
  }
};
