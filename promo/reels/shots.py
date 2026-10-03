#!/usr/bin/env python3
"""縦型リール2本(絵カード無料配布 / ポータル紹介)の素材を実画面から撮る。

スマホ幅 390px のビューポートを dsf=3 で撮る。動画(幅1080)では
CSSピクセル×(1080/390) で表示するので、ビューポートの高さは 1920/(1080/390)≒694 にそろえる。
要素の座標は remotion/public/manifest.json に書き出し、動画側はその座標で動きを作る。

使い方:
    (Englishapp のルートで) python3 -m http.server 8000 &
    (PictureDictionary のルートで) python3 -m http.server 8001 &
    python3 shots.py
"""
import json
import shutil
from PIL import Image
from playwright.sync_api import sync_playwright
from capture_common import HERE, PORTAL, PD_DIR, CHROME, setup_routes, settle, rect

PUB = HERE / "remotion" / "public"
OUT = PUB / "shots"
VW, VH, DSF = 390, 694, 3

SEARCH_TERM = "day"
TAP_CARD = "Monday"
HOOK_CARDS = [
    "apple.jpg", "cat.jpg", "dog.jpg", "sunny.jpg", "rainbow.jpg", "pizza.jpg",
    "soccer.jpg", "cake.jpg", "elephant.jpg", "strawberry.jpg", "banana.jpg",
    "umbrella.jpg", "penguin.jpg", "rabbit.jpg", "panda.jpg", "ice cream.jpg",
    "hamburger.jpg", "sushi.jpg", "lion.jpg", "dolphin.jpg", "grapes.jpg",
    "watermelon.jpg", "snowy.jpg", "star.jpg", "flower.jpg", "bus stop.jpg",
    "doctor.jpg", "teacher.jpg", "guitar.jpg", "notebook.jpg",
]
# ポータル紹介で「遊んでいる画面」を見せるアプリ(学年順)。押すボタンの文言つき
PLAY_APPS = [
    ("g3_u6_alphabet", ["ひとりで"], "3年生", "アルファベット大文字かるた"),
    ("g3_u9_animals", ["スタート!"], "3年生", "どうぶつ・からだ神経衰弱"),
    ("g4_u2_weather", ["コーデを"], "4年生", "天気&服装コーディネート"),
    ("g4_u4_clock", ["とけいを"], "4年生", "なんじなにをする?時計アプリ"),
    ("g5_u6_restaurant", ["ひとりで"], "5年生", "バーチャルレストラン注文"),
    ("g5_u7_sugoroku", ["すごろくで"], "5年生", "季節と行事すごろく"),
    ("g6_u5_foodchain", ["フードチェーン"], "6年生", "食物連鎖クイズビルダー"),
]

# 2人組の活動(情報差・インタビュー)が入り口から見えるアプリ
PAIR_APPS = ["g6_u1_profile", "smalltalk"]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    man = {"vw": VW, "vh": VH, "dsf": DSF}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME)
        ctx = browser.new_context(viewport={"width": VW, "height": VH}, device_scale_factor=DSF,
                                  is_mobile=True, has_touch=True)
        setup_routes(ctx)
        page = ctx.new_page()

        # ---- ポータル全景 ----
        page.goto(f"{PORTAL}/index.html", wait_until="networkidle")
        page.wait_for_selector("#sections .app-card", state="visible", timeout=30000)
        settle(page, 1200)
        man["portal_h"] = page.evaluate("() => document.documentElement.scrollHeight")
        man["portal_material"] = rect(page, ".material-sec")
        man["portal_btn"] = rect(page, '.material-sec a[href="cards.html"]')
        man["portal_nav"] = rect(page, "#gradenav")
        man["portal_featured"] = rect(page, ".featured")
        page.screenshot(path=str(OUT / "portal_full.png"), full_page=True)
        print("portal_full", man["portal_h"], man["portal_btn"])

        # ---- 学年タブを押した状態(ポータル紹介用) ----
        man["grade_tabs"] = {}
        for g in ["g3", "g4", "g5", "g6"]:
            page.evaluate("() => window.scrollTo(0, 0)")
            page.click(f'.gnav-btn[data-g="{g}"]')
            page.wait_for_timeout(500)
            settle(page, 500)
            tab = rect(page, f'.gnav-btn[data-g="{g}"]')
            nav = rect(page, "#gradenav")
            n = page.evaluate("""(g) => [...document.querySelectorAll('#sections .app-card')]
                                   .filter(e => e.offsetParent !== null).length""", g)
            h = page.evaluate("() => document.documentElement.scrollHeight")
            head = rect(page, f".grade-head.{g}")
            page.screenshot(path=str(OUT / f"portal_{g}.png"), full_page=True)
            man["grade_tabs"][g] = {"tab": tab, "nav": nav, "head": head, "count": n, "h": h}
            print("portal", g, n, "apps")
        page.click('.gnav-btn[data-g="all"]')

        # ---- 絵カードライブラリ ----
        page.goto(f"{PORTAL}/cards.html", wait_until="networkidle")
        page.wait_for_selector(".card", state="visible", timeout=30000)
        for _ in range(3):
            page.click("#btn-more")
            page.wait_for_timeout(400)
        settle(page, 1500)
        man["lib_h"] = page.evaluate("() => document.documentElement.scrollHeight")
        man["lib_search"] = rect(page, "#q")
        man["lib_zip"] = rect(page, '.intro a[href*="main.zip"]')
        man["lib_intro"] = rect(page, ".intro")
        page.screenshot(path=str(OUT / "library_full.png"), full_page=True)

        # 検索の前後は同じスクロール位置で撮る(検索窓が画面の上から 1/3 あたりに来る位置)
        lib_scroll = max(0, round(man["lib_search"]["y"] - 250))
        page.evaluate(f"() => window.scrollTo(0, {lib_scroll})")
        settle(page, 500)
        man["lib_scroll"] = page.evaluate("() => Math.round(window.scrollY)")
        page.screenshot(path=str(OUT / "library_pre.png"))

        page.fill("#q", SEARCH_TERM)
        page.wait_for_timeout(600)
        page.evaluate(f"() => window.scrollTo(0, {lib_scroll})")
        settle(page, 900)
        assert page.evaluate("() => Math.round(window.scrollY)") == man["lib_scroll"]
        el = page.locator(".gallery .card", has=page.locator(f'.name:text-is("{TAP_CARD}")')).first
        el.wait_for(state="visible", timeout=30000)
        b = el.bounding_box()
        man["lib_tap_card"] = {"x": b["x"], "y": b["y"], "w": b["width"], "h": b["height"]}
        man["lib_count_search"] = page.inner_text("#count")
        man["search_term"], man["tap_card"] = SEARCH_TERM, TAP_CARD
        page.screenshot(path=str(OUT / "library_search.png"))
        print("library", man["lib_scroll"], man["lib_count_search"], man["lib_tap_card"])

        # ---- 遊んでいる画面 ----
        # アプリはスマホの枠に入れて見せるので、ふつうのスマホの高さ(844)で撮る。
        # (かるたは高さが足りないと札の文字が小さくなりすぎて写らない)
        page.set_viewport_size({"width": VW, "height": 844})
        man["play_apps"] = []
        for app, clicks, grade, name in PLAY_APPS:
            page.goto(f"{PORTAL}/apps/{app}.html", wait_until="networkidle")
            settle(page, 700)
            for btn in clicks:
                page.get_by_text(btn).first.click(timeout=5000)
                page.wait_for_timeout(600)
            # 札が並ぶ・カードがめくれるなどの登場アニメを待つ
            # (かるたは時間がたつと札の文字が消えるので短めに撮る)
            page.wait_for_timeout(1200 if app == "g3_u6_alphabet" else 2600)
            settle(page, 300)
            page.screenshot(path=str(OUT / f"play_{app}.png"))
            man["play_apps"].append({"file": f"play_{app}.png", "grade": grade, "name": name})
        print("play apps", len(man["play_apps"]))

        # ---- 2人組の活動を選ぶ画面(メニューそのものを見せる) ----
        man["pair_apps"] = []
        for app in PAIR_APPS:
            page.goto(f"{PORTAL}/apps/{app}.html", wait_until="networkidle")
            settle(page, 800)
            page.screenshot(path=str(OUT / f"pair_{app}.png"))
            man["pair_apps"].append(f"pair_{app}.png")
        page.set_viewport_size({"width": VW, "height": VH})

        # ---- 33本の壁(各アプリの最初の画面。小さく並べるので dsf=1.5) ----
        ctx2 = browser.new_context(viewport={"width": VW, "height": VH}, device_scale_factor=1.5,
                                   is_mobile=True, has_touch=True)
        setup_routes(ctx2)
        p2 = ctx2.new_page()
        p2.goto(f"{PORTAL}/index.html", wait_until="networkidle")
        apps = p2.evaluate("() => APPS.filter(a => a.status === 'live').map(a => a.file)")
        (OUT / "wall").mkdir(exist_ok=True)
        man["wall"] = []
        for f in apps:
            p2.goto(f"{PORTAL}/{f}", wait_until="networkidle")
            settle(p2, 600)
            name = "wall/" + f.split("/")[-1].replace(".html", ".png")
            p2.screenshot(path=str(OUT / name))
            man["wall"].append(name)
        man["app_count"] = len(apps)
        print("wall", len(apps))

        # ---- タップして開いた大きな絵カード ----
        page.goto(f"https://edupower07.github.io/PictureDictionary/images/{TAP_CARD}.jpg", wait_until="load")
        page.wait_for_timeout(700)
        page.screenshot(path=str(OUT / "card_big.png"))
        browser.close()

    # 動画で使うのはページの上のほうだけ。縦に長すぎる画像は毎フレームの描画が重いので切り詰める
    Image.MAX_IMAGE_PIXELS = None
    for src, dst, css_h in [("library_full.png", "library_top.png", 2400)] + \
            [(f"portal_{g}.png", f"portal_{g}.png", 2600) for g in ["g3", "g4", "g5", "g6"]]:
        im = Image.open(OUT / src)
        im.crop((0, 0, im.width, min(im.height, css_h * DSF))).save(OUT / dst, optimize=True)
        if src != dst:
            (OUT / src).unlink()

    cards = PUB / "cards"
    cards.mkdir(exist_ok=True)
    man["hook_cards"] = []
    for f in HOOK_CARDS:
        src = PD_DIR / "images" / f
        if src.exists():
            shutil.copy(src, cards / f.replace(" ", "_"))
            man["hook_cards"].append(f.replace(" ", "_"))
    man["card_total"] = len(list((PD_DIR / "images").glob("*.jpg")))
    (PUB / "manifest.json").write_text(json.dumps(man, ensure_ascii=False, indent=2), encoding="utf-8")
    print("hook cards", len(man["hook_cards"]), "card_total", man["card_total"])


if __name__ == "__main__":
    main()
