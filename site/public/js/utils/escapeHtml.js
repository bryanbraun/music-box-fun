export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAndHighlightHtml(text) {
  return escapeHtml(text)
    .replace(/\[\[/g, "<b>")
    .replace(/\]\]/g, "</b>");
}
