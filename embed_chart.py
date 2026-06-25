from pathlib import Path

root = Path(__file__).parent
html_path = root / "index.html"
svg_path = root / "chart-template.svg"
html = html_path.read_text(encoding="utf-8")
svg = svg_path.read_text(encoding="utf-8").strip()
svg_esc = svg.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

marker_start = "    /* CHART_SVG_EMBED */"
marker_end = "    /* END_CHART_SVG_EMBED */"

block = marker_start + "\n    const CHART_SVG = `" + svg_esc + "`;\n" + marker_end

if marker_start in html:
    si = html.index(marker_start)
    ei = html.index(marker_end) + len(marker_end)
    new_html = html[:si] + block + html[ei:]
else:
    anchor = "  let chartSvgTemplate = null;"
    if anchor not in html:
        raise SystemExit("anchor not found")
    new_html = html.replace(anchor, block + "\n\n  let chartSvgTemplate = null;", 1)

html_path.write_text(new_html, encoding="utf-8")
print("embedded", len(svg), "chars")
