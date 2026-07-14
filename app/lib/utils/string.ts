export function capitalize(value: string) {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function initials(value: string) {
  return value
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
