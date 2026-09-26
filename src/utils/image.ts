export function getGameCoverUrl(title: string): string {
  const filename = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents (e.g. ö -> o)
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters like '
    .trim()
    .replace(/\s+/g, "-");
  
  return `/assets/images/${filename}.jpg`;
}
