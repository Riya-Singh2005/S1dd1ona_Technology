/** Marketing analytics are intentionally absent from the private admin tool. */
export function shouldLoadSiteAnalytics(pathname: string): boolean {
  return pathname !== "/admin" && !pathname.startsWith("/admin/");
}
