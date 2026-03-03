"""Extracts all sources/citations from index.html and prints a sorted list."""

import re
from html.parser import HTMLParser
from pathlib import Path


class TextExtractor(HTMLParser):
    """Strip HTML tags, keep text."""
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def get_text(self):
        return "".join(self.parts).strip()


def strip_html(html_str):
    ext = TextExtractor()
    ext.feed(html_str)
    return ext.get_text()


def extract_sources(html_path):
    text = Path(html_path).read_text(encoding="utf-8")

    sources = []

    # 1) <p class="source">...</p> blocks
    for m in re.finditer(r'<p\s+class="source"[^>]*>(.*?)</p>', text, re.DOTALL):
        raw = strip_html(m.group(1)).strip()
        if raw:
            sources.append(("Quellenangabe", raw))

    # 2) <a href="...">...</a> inside .resource-list
    for block in re.finditer(
        r'<ul\s+class="resource-list">(.*?)</ul>', text, re.DOTALL
    ):
        for link in re.finditer(
            r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>', block.group(1), re.DOTALL
        ):
            url = link.group(1)
            label = strip_html(link.group(2)).strip()
            sources.append(("Ressource", f"{label} — {url}"))

    # 3) Inline citations like (Author et al., 2025) or (Author, 2025)
    for m in re.finditer(
        r'\(([A-Z][a-zäöüß]+(?:\s+(?:et\s+al\.|&amp;\s*[A-Z][a-zäöüß]+|&\s*[A-Z][a-zäöüß]+))*'
        r'(?:,\s*\d{4}))\)',
        text
    ):
        cite = strip_html(m.group(1)).strip()
        sources.append(("Inline-Zitat", cite))

    return sources


def deduplicate_and_sort(sources):
    seen = set()
    unique = []
    for typ, text in sources:
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        key = text.lower()
        if key not in seen:
            seen.add(key)
            unique.append((typ, text))
    unique.sort(key=lambda x: x[1].lower())
    return unique


if __name__ == "__main__":
    html_file = Path(__file__).parent / "index.html"
    out_file = Path(__file__).parent / "sources.txt"
    raw = extract_sources(html_file)
    sources = deduplicate_and_sort(raw)

    lines = []
    lines.append(f"=== Quellen im Leitfaden ({len(sources)} Einträge) ===\n")

    current_type = None
    for typ, text in sorted(sources, key=lambda x: (x[0], x[1].lower())):
        if typ != current_type:
            lines.append(f"\n--- {typ} ---")
            current_type = typ
        lines.append(f"  • {text}")

    lines.append(f"\n=== Gesamt: {len(sources)} unique Quellen ===")

    output = "\n".join(lines)
    out_file.write_text(output, encoding="utf-8")
    print(f"Gespeichert: {out_file} ({len(sources)} Quellen)")
