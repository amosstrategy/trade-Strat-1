#!/usr/bin/env python3
"""Verify hd-engine.js against openhumandesign-library E2E fixture (Swiss Ephemeris)."""
from __future__ import annotations

import http.server
import json
import os
import socket
import sys
import threading
from datetime import datetime, timezone

EXPECTED = {
    "profile": "1/3",
    "type": "Generator",
    "authority": "Emotional",
    "defined_centers": {"Sacral", "Solar", "Root"},
    "active_gates": {1, 5, 6, 7, 9, 10, 13, 14, 21, 29, 30, 38, 39, 41, 48, 52, 54, 58, 61},
    "personality": {
        "sun": (38, 1), "earth": (39, 1), "moon": (30, 3), "north_node": (13, 4), "south_node": (7, 4),
        "mercury": (61, 6), "venus": (41, 5), "mars": (9, 5), "jupiter": (52, 2), "saturn": (54, 1),
        "uranus": (58, 3), "neptune": (38, 3), "pluto": (1, 5),
    },
    "design": {
        "sun": (48, 3), "earth": (21, 3), "moon": (5, 4), "north_node": (30, 1), "south_node": (29, 1),
        "mercury": (6, 4), "venus": (14, 3), "mars": (48, 1), "jupiter": (39, 1), "saturn": (58, 5),
        "uranus": (10, 4), "neptune": (38, 1), "pluto": (1, 1),
    },
}


def compare_result(data: dict) -> list[str]:
    errs: list[str] = []
    if data.get("error"):
        return [f"engine error: {data['error']}"]

    if data["profile"] != EXPECTED["profile"]:
        errs.append(f"profile: {data['profile']} != {EXPECTED['profile']}")
    if data["type"] != EXPECTED["type"]:
        errs.append(f"type: {data['type']} != {EXPECTED['type']}")
    if data.get("authority") != EXPECTED["authority"]:
        errs.append(f"authority: {data.get('authority')} != {EXPECTED['authority']}")
    if set(data["definedCenters"]) != EXPECTED["defined_centers"]:
        errs.append(f"centers: {set(data['definedCenters'])} != {EXPECTED['defined_centers']}")
    if set(data["gates"]) != EXPECTED["active_gates"]:
        errs.append(
            f"gates missing {sorted(EXPECTED['active_gates'] - set(data['gates']))} "
            f"extra {sorted(set(data['gates']) - EXPECTED['active_gates'])}"
        )
    for layer in ("personality", "design"):
        for planet, exp in EXPECTED[layer].items():
            got = tuple(data[layer][planet])
            if got != exp:
                errs.append(f"{layer}.{planet}: {got} != {exp}")
    return errs


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def run_browser_verify(root: str) -> tuple[dict | None, list[str]]:
    port = free_port()
    os.chdir(root)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f"http://127.0.0.1:{port}/verify-reference.html", wait_until="load", timeout=120000)
            page.wait_for_function("window.__VERIFY_DONE__ === true", timeout=120000)
            raw = page.evaluate("window.__VERIFY_RESULT__")
            browser.close()
        if not raw:
            return None, ["No result from browser harness"]
        return raw, compare_result(raw)
    except Exception as exc:
        return None, [f"Browser verify failed: {exc}"]
    finally:
        httpd.shutdown()


def main() -> int:
    root = os.path.dirname(os.path.abspath(__file__))
    birth = datetime(1990, 1, 1, 0, 1, tzinfo=timezone.utc)
    print("Reference: openhumandesign-library test-person-1")
    print(f"Birth: {birth.isoformat()}")
    print("=== hd-engine.js + Swiss Ephemeris (browser) ===")

    data, errs = run_browser_verify(root)
    if data and not errs:
        print("PASS — profile, type, authority, centers, gates, all 26 planet activations match")
        print(f"  designUtc: {data.get('designUtc', '?')}")
        return 0

    print("FAIL")
    for err in errs:
        print(" ", err)
    if data:
        print("\nGot:", json.dumps(data, indent=2))
    return 1


if __name__ == "__main__":
    sys.exit(main())
