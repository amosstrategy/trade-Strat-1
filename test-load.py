#!/usr/bin/env python3
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


def test_url(url, label, timeout=45):
    logs = []
    t0 = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda m: logs.append(f"[{time.time()-t0:.1f}s] {m.type}: {m.text}"))
        page.on("pageerror", lambda e: logs.append(f"[{time.time()-t0:.1f}s] ERR: {e}"))
        page.on("requestfailed", lambda r: logs.append(f"[{time.time()-t0:.1f}s] FAIL {r.url}"))
        page.goto(url, wait_until="domcontentloaded", timeout=timeout * 1000)
        result = "TIMEOUT"
        for _ in range(timeout):
            if page.evaluate("window.HDEphemeris?.ready === true"):
                result = "PASS"
                break
            err = page.evaluate("window.HDEphemeris?.error")
            if err:
                result = f"ERROR: {err}"
                break
            time.sleep(1)
        elapsed = time.time() - t0
        app_snip = page.evaluate("() => (document.getElementById('app')?.innerText || '').slice(0, 80)")
        browser.close()
    print(f"{label}: {result} in {elapsed:.1f}s")
    print(f"  app: {app_snip!r}")
    for line in logs[-8:]:
        print(f"  {line}")
    return result == "PASS"


if __name__ == "__main__":
    local = len(sys.argv) > 1 and sys.argv[1] == "local-only"
    ok = test_url("http://127.0.0.1:8765/index.html", "LOCAL_HTTP")
    if not local:
        file_url = (ROOT / "index.html").as_uri()
        test_url(file_url, "FILE_PROTOCOL")
    sys.exit(0 if ok else 1)
