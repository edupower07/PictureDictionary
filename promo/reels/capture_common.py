"""撮影の共通部品: Google Fonts と絵カード画像をローカルから流し込む。

Chromium は HTTPS_PROXY を読まないので外部へは出られない(スキル pitfalls 1番)。
- fonts.googleapis.com → 取得済み woff2 の @font-face に差し替え
- edupower07.github.io/PictureDictionary/images/ と raw.githubusercontent の画像 → ローカルクローン
"""
import os
import re
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
FONTS = Path(os.environ.get("FONTS_DIR", HERE / "fonts"))
PD_DIR = Path(os.environ.get("PD_DIR", HERE.parent.parent))
PORTAL = os.environ.get("PORTAL_BASE", "http://localhost:8000")
PD = os.environ.get("PD_BASE", "http://localhost:8001")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FONT_PREFIX = f"{PORTAL}/__fonts/"


def font_css() -> str:
    css = ""
    for d in sorted(FONTS.iterdir()):
        f = d / "fonts.css"
        if f.exists():
            css += re.sub(r"url\(([^)]+\.woff2)\)", rf"url({FONT_PREFIX}{d.name}/\1)",
                          f.read_text(encoding="utf-8")) + "\n"
    return css


FONT_CSS = font_css()


def pd_image(name: str):
    fp = PD_DIR / "images" / name
    return fp if fp.exists() else None


def setup_routes(context):
    def handler(route):
        url = route.request.url
        if url.startswith(FONT_PREFIX):
            fp = FONTS / url[len(FONT_PREFIX):]
            if fp.exists():
                return route.fulfill(status=200, body=fp.read_bytes(), headers={
                    "Content-Type": "font/woff2", "Access-Control-Allow-Origin": "*"})
            return route.fulfill(status=404, body="nf")
        if url.startswith(PORTAL) or url.startswith(PD):
            return route.continue_()
        if "fonts.googleapis.com" in url:
            return route.fulfill(status=200, content_type="text/css", body=FONT_CSS)
        if "fonts.gstatic.com" in url:
            return route.abort()
        for key in ("/PictureDictionary/images/", "/PictureDictionary/main/images/"):
            if key in url:
                fp = pd_image(unquote(url.split(key, 1)[1].split("?")[0]))
                if fp:
                    return route.fulfill(status=200, body=fp.read_bytes(), content_type="image/jpeg")
                return route.abort()
        if url.startswith("https://edupower07.github.io/PictureDictionary/"):
            return route.fulfill(status=302, headers={"Location": PD + url.split("/PictureDictionary", 1)[1]})
        return route.abort()

    context.route("**/*", handler)


def settle(page, ms=900):
    """フォント・画像の読み込みを待つ。"""
    page.evaluate("() => document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; })")
    page.wait_for_timeout(ms)
    page.evaluate("() => document.fonts.ready")
    page.wait_for_function(
        "() => [...document.querySelectorAll('img')].every(i => !i.src || i.complete)", timeout=60000)
    page.wait_for_timeout(300)


def rect(page, selector):
    """要素のページ絶対座標(CSSピクセル)。測ってすぐ使う(pitfalls 4番)。"""
    el = page.wait_for_selector(selector, state="visible", timeout=30000)
    b = el.bounding_box()
    sx, sy = page.evaluate("() => [window.scrollX, window.scrollY]")
    return {"x": b["x"] + sx, "y": b["y"] + sy, "w": b["width"], "h": b["height"]}
