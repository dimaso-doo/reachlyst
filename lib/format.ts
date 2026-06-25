export function truncateMiddle(value?: string | null, maxLength = 54) {
  if (!value) return "No URL yet";
  if (value.length <= maxLength) return value;
  const side = Math.floor((maxLength - 3) / 2);
  return `${value.slice(0, side)}...${value.slice(value.length - side)}`;
}
