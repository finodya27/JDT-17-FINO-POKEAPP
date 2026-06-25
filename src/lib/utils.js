export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(str) {
  if (!str) return "";
  // Split by dash (e.g., mime-jr -> Mime Jr.)
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function padId(id) {
  if (!id) return "#000";
  return `#${String(id).padStart(3, "0")}`;
}
