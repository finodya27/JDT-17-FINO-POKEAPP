export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(str: string | undefined | null): string {
  if (!str) return "";
  
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function padId(id: number | string | undefined | null): string {
  if (!id) return "#000";
  return `#${String(id).padStart(3, "0")}`;
}
