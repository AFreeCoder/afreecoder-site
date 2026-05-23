/** YYYY-MM-DD → YYYY/MM/DD, used in mono date labels across the site. */
export function formatDate(d: string): string {
  return d.replaceAll("-", "/");
}
