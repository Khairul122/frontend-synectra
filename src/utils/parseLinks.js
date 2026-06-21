const URL_REGEX = /(https?:\/\/\S+)/;

export function extractLinksFromDescription(description) {
  if (!description) return [];

  return description
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(URL_REGEX);
      if (!match) return null;

      const url = match[1].trim();
      const name = line
        .slice(0, match.index)
        .replace(/[\s:\-–]+$/, '')
        .trim();

      return { name: name || 'Link', url };
    })
    .filter(Boolean);
}
