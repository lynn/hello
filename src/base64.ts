export function encode(text: string): string {
  return window
    .btoa(text)
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=*$/, "");
}

export function decode(text: string): string {
  return window.atob(text.replace(/_/g, "/").replace(/-/g, "+"));
}
