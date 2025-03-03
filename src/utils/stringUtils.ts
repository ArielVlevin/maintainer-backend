/**
 * Extracts tags from an object and returns them as an array.
 *
 * @param tagsObject - The object that may contain tags.
 * @returns An array of tags (strings).
 */
export function extractTags(tagsObject: any): string[] {
  if (typeof tagsObject === "string")
    return tagsObject.split(",").map((tag) => tag.trim());
  else if (typeof tagsObject === "object" && tagsObject !== null) {
    const firstKey = Object.keys(tagsObject)[0];
    if (typeof tagsObject[firstKey] === "string")
      return tagsObject[firstKey].split(",").map((tag) => tag.trim());
  }
  return [];
}
