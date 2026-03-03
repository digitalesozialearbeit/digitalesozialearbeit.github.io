"""
Link-Checker für den Eli-Leitfaden (index.html).
Prüft externe Links (HTTP + Content), interne Anker und Mixed Content.

Usage:
    python check_links.py              # Anker + Mixed Content prüfen
    python check_links.py --check      # + HTTP-Status externer Links
    python check_links.py --check --csv results.csv   # + CSV-Export
"""

import re
import sys
import csv
import time
import argparse
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self._current_href = None
        self._current_text_parts = []
        self._in_a = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if "id" in attrs_dict:
            self.ids.add(attrs_dict["id"])
        if tag == "a":
            href = attrs_dict.get("href", "")
            if href:
                self._current_href = href
                self._current_text_parts = []
                self._in_a = True

    def handle_data(self, data):
        if self._in_a:
            self._current_text_parts.append(data.strip())

    def handle_endtag(self, tag):
        if tag == "a" and self._in_a:
            text = " ".join(self._current_text_parts).strip()
            self.links.append((self._current_href, text))
            self._in_a = False
            self._current_href = None
            self._current_text_parts = []


def extract_links(html_path):
    """Alle <a href="..."> und id-Attribute aus der HTML-Datei extrahieren."""
    html = Path(html_path).read_text(encoding="utf-8")
    parser = LinkExtractor()
    parser.feed(html)
    return parser.links, parser.ids


def classify_link(href):
    """Link-Typ bestimmen: external, anchor, mailto, tel, other."""
    if href.startswith("mailto:"):
        return "mailto"
    if href.startswith("tel:"):
        return "tel"
    if href.startswith("#"):
        return "anchor"
    parsed = urlparse(href)
    if parsed.scheme in ("http", "https"):
        return "external"
    return "other"


# Patterns die auf Soft-404 / Access-Denied hinweisen (auch bei HTTP 200)
SOFT_ERROR_PATTERNS = [
    r"access\s+denied",
    r"you are not authorized",
    r"page\s+not\s+found",
    r"404\s+not\s+found",
    r"this page (doesn.t|does not) exist",
    r"requested page (was|could) not be found",
    r"no longer available",
    r"has been removed",
    r"has been deleted",
    r"content.*(unavailable|not available)",
    r"error\s+404",
    r"seite nicht gefunden",
    r"zugriff verweigert",
]
_SOFT_ERROR_RE = re.compile(
    "|".join(SOFT_ERROR_PATTERNS), re.IGNORECASE
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
}


def check_url(url, timeout=15):
    """HEAD-first, GET-Fallback bei 405 oder Content-Check noetig."""
    try:
        # HEAD zuerst (schneller)
        r = requests.head(url, headers=HEADERS, timeout=timeout,
                          allow_redirects=True)

        # Bei 405 (Method Not Allowed) oder verdaechtigem Status: GET
        needs_get = r.status_code == 405 or r.status_code >= 400
        if not needs_get and 200 <= r.status_code < 300:
            # HEAD war OK - Redirect-Info sammeln
            final_url = r.url if r.url != url else None
            redirected = bool(r.history)
            return r.status_code, "", final_url, redirected

        # GET fuer Content-Check
        r = requests.get(url, headers=HEADERS, timeout=timeout,
                         allow_redirects=True)
        status = r.status_code
        final_url = r.url if r.url != url else None
        redirected = bool(r.history)

        # Content-Check: bei 200 trotzdem auf Fehler-Texte pruefen
        content_warning = ""
        if 200 <= status < 300:
            snippet = r.text[:5000].lower()
            match = _SOFT_ERROR_RE.search(snippet)
            if match:
                content_warning = f"Soft-Error: \"{match.group().strip()}\""

                title_match = re.search(
                    r"<title[^>]*>(.*?)</title>", snippet, re.DOTALL
                )
                if title_match:
                    title = title_match.group(1).strip()[:60]
                    content_warning += f" (Title: {title})"

        return status, content_warning, final_url, redirected

    except requests.exceptions.SSLError:
        return None, "SSL-Fehler", None, False
    except requests.exceptions.ConnectionError:
        return None, "Verbindung fehlgeschlagen", None, False
    except requests.exceptions.Timeout:
        return None, "Timeout", None, False
    except requests.exceptions.RequestException as e:
        return None, str(e)[:80], None, False


def main():
    parser = argparse.ArgumentParser(description="Link-Checker fuer index.html")
    parser.add_argument("--file", default="index.html",
                        help="HTML-Datei (default: index.html)")
    parser.add_argument("--check", action="store_true",
                        help="HTTP-Status der externen Links pruefen")
    parser.add_argument("--csv", metavar="FILE",
                        help="Ergebnisse als CSV speichern")
    args = parser.parse_args()

    html_path = Path(__file__).parent / args.file
    if not html_path.exists():
        print(f"Datei nicht gefunden: {html_path}")
        sys.exit(1)

    links, page_ids = extract_links(html_path)

    # Deduplizieren
    seen = {}
    for href, text in links:
        if href not in seen:
            seen[href] = {"text": text, "type": classify_link(href), "count": 1}
        else:
            seen[href]["count"] += 1

    external = {k: v for k, v in seen.items() if v["type"] == "external"}
    anchors = {k: v for k, v in seen.items() if v["type"] == "anchor"}
    other = {k: v for k, v in seen.items()
             if v["type"] not in ("external", "anchor")}

    print(f"\n{'='*60}")
    print(f"  Link-Report: {args.file}")
    print(f"{'='*60}")
    print(f"  Gesamt:    {len(links)} Links ({len(seen)} unique)")
    print(f"  Extern:    {len(external)}")
    print(f"  Anker:     {len(anchors)} (-> {len(page_ids)} IDs im Dokument)")
    print(f"  Sonstige:  {len(other)} (mailto, tel, etc.)")
    print(f"{'='*60}\n")

    all_problems = []

    # --- 1. Anker-Pruefung ---
    broken_anchors = []
    for href, info in anchors.items():
        target_id = href[1:]
        if target_id not in page_ids:
            broken_anchors.append((href, info["text"]))

    if broken_anchors:
        print(f"KAPUTTE ANKER ({len(broken_anchors)}):")
        print("-" * 60)
        for href, text in broken_anchors:
            print(f"  {href}")
            print(f"    Linktext: {text[:60]}")
            all_problems.append({
                "result": "ANKER", "url": href,
                "text": text, "error": "ID existiert nicht",
            })
        print()
    else:
        print(f"Anker: alle {len(anchors)} OK")

    # --- 2. Mixed Content ---
    http_links = [k for k in external if k.startswith("http://")]
    if http_links:
        print(f"\nMIXED CONTENT ({len(http_links)} x http://):")
        print("-" * 60)
        for url in http_links:
            print(f"  {url}")
            all_problems.append({
                "result": "HTTP", "url": url,
                "text": external[url]["text"],
                "error": "http:// statt https://",
            })
        print()
    else:
        print(f"Mixed Content: keine http:// Links")

    print()

    # --- 3. HTTP-Check ---
    results = []
    if args.check:
        if not HAS_REQUESTS:
            print("!! 'requests' nicht installiert. Bitte: pip install requests")
            sys.exit(1)

        print(f"{'='*60}")
        print("  HTTP-Status pruefen...")
        print(f"{'='*60}\n")

        ok, warn, fail = 0, 0, 0
        for i, (url, info) in enumerate(external.items(), 1):
            sys.stdout.write(f"\r  Pruefe {i}/{len(external)}...")
            sys.stdout.flush()

            status, error, final_url, redirected = check_url(url)

            if status and 200 <= status < 400 and not error:
                symbol = "OK"
                ok += 1
            elif status and 200 <= status < 400 and error:
                symbol = f"INHALT ({status})"
                warn += 1
            elif status and 400 <= status < 500:
                symbol = f"WARN ({status})"
                warn += 1
            else:
                symbol = f"FAIL ({status or error})"
                fail += 1

            # Redirect-Info
            redirect_info = ""
            if redirected and final_url:
                # Nur melden wenn Host sich aendert (nicht bloss http->https)
                orig_host = urlparse(url).netloc
                final_host = urlparse(final_url).netloc
                if orig_host != final_host:
                    redirect_info = f"Redirect -> {final_url[:70]}"

            result_entry = {
                "url": url,
                "text": info["text"],
                "status": status,
                "error": error,
                "result": symbol,
                "redirect": redirect_info,
            }
            results.append(result_entry)

            time.sleep(0.5)

        sys.stdout.write("\r" + " " * 40 + "\r")

        problems = [r for r in results if r["result"] != "OK"]
        all_problems.extend(problems)

        print(f"  {ok} OK / {warn} Warnung / {fail} Fehler")
        print(f"{'='*60}")

        if problems:
            print(f"\nPROBLEME ({len(problems)}):\n")
            for r in problems:
                print(f"  {r['result']:20s} {r['url']}")
                print(f"  {'':20s} Linktext: {r['text'][:60]}")
                if r["error"]:
                    print(f"  {'':20s} Detail: {r['error']}")
                if r.get("redirect"):
                    print(f"  {'':20s} {r['redirect']}")
                print()
        else:
            print("\nAlle externen Links OK!")

        # Redirects separat melden (auch bei OK-Status)
        redirects = [r for r in results
                     if r.get("redirect") and r["result"] == "OK"]
        if redirects:
            print(f"\nREDIRECTS ({len(redirects)}, funktionieren aber):\n")
            for r in redirects:
                print(f"  {r['url'][:55]}")
                print(f"    -> {r['redirect']}")
                print()

    # --- CSV-Export (nur Probleme) ---
    if args.csv:
        csv_path = Path(args.csv)
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Typ", "URL", "Linktext", "Detail"])
            for r in all_problems:
                writer.writerow([
                    r["result"],
                    r["url"],
                    r["text"],
                    r.get("error", "") or r.get("redirect", ""),
                ])
        if all_problems:
            print(f"\nCSV gespeichert: {csv_path}")
        else:
            print("\nKeine Probleme -- keine CSV erstellt.")


if __name__ == "__main__":
    main()
