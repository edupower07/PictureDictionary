#!/usr/bin/env python3
"""リール③(Picture Dictionary 紹介)の素材を実画面から撮る。

PictureDictionary を 8001 番で配信しておくこと(画像はローカルの images/ がそのまま出る)。
1カット1枚。状態はクリック操作で作る。スマホ幅 390×844 を dsf=3 で撮る。
"""
import json
from playwright.sync_api import sync_playwright
from capture_common import HERE, PD, CHROME, setup_routes, settle

OUT = HERE / "remotion" / "public" / "shots" / "pd"
VW, VH, DSF = 390, 844, 3
URL = f"{PD}/index.html"


def fresh(ctx, init=None):
    page = ctx.new_page()
    if init:
        page.add_init_script(init)
    page.goto(URL, wait_until="networkidle")
    settle(page, 900)
    page.add_style_tag(content="::-webkit-scrollbar{display:none}")
    # 読み上げを記録しておく(クイズ・かるたで正解のカードを押すため)
    page.evaluate("""() => {
      if (window.speak && !window.__hooked) {
        const o = window.speak; window.__hooked = true; window.__spoken = null;
        window.speak = (w, r) => { window.__spoken = w; try { return o(w, r); } catch (e) {} };
      }
    }""")
    return page


def tap(page, sel, wait=600):
    page.locator(sel).first.click(timeout=8000)
    page.wait_for_timeout(wait)


def js(page, code, wait=400):
    page.evaluate(code)
    page.wait_for_timeout(wait)


def snap(page, name, man, note=""):
    settle(page, 400)
    page.screenshot(path=str(OUT / f"{name}.png"))
    man[name] = note
    print("shot", name, note)


CLICK_CORRECT = """(sel) => {
  const w = (window.__spoken || '').toLowerCase();
  const cards = [...document.querySelectorAll(sel)];
  const hit = cards.find(c => { const i = c.querySelector('img'); if (!i) return false;
    const b = decodeURIComponent(i.getAttribute('src')||'').split('/').pop().replace(/\\.jpe?g$/i,'').toLowerCase();
    return b === w || b.startsWith(w + '_'); });
  (hit || cards[0]).click();
}"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mf = OUT / "manifest.json"
    man = json.loads(mf.read_text(encoding="utf-8")) if mf.exists() else {}
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)
        ctx = b.new_context(viewport={"width": VW, "height": VH}, device_scale_factor=DSF,
                            is_mobile=True, has_touch=True)
        setup_routes(ctx)

        pg = fresh(ctx)
        snap(pg, "grade", man, "学年をえらぶ画面")
        tap(pg, ".grade-btn.g3", 900)
        snap(pg, "home", man, "3年生・学ぶ のカテゴリ一覧")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#category-list .cat-card >> nth=7", 900)
        snap(pg, "study", man, "学ぶ:単語カード")
        cards = pg.evaluate("""() => [...document.querySelectorAll('#card-area .word-card')].slice(0,4)
            .map(c => { const r = c.getBoundingClientRect(); return {x:r.x, y:r.y+scrollY, w:r.width, h:r.height}; })""")
        man["study_cards"] = cards
        tap(pg, "#card-area .word-card >> nth=0 >> .rec-btn-mini", 900)
        js(pg, "() => document.getElementById('btn-record') && document.getElementById('btn-record').click()", 1500)
        js(pg, "() => document.getElementById('btn-record') && document.getElementById('btn-record').click()", 900)
        snap(pg, "rec", man, "発音練習(ろくおん)")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#t-practice", 600)
        tap(pg, "#category-list .cat-card >> nth=1", 800)
        tap(pg, "#quiz-level-select .big-option-btn >> nth=0", 1500)
        snap(pg, "quiz", man, "練習:聞いてえらぶクイズ")
        js(pg, f"() => ({CLICK_CORRECT})('#card-area .quiz-card')", 450)
        snap(pg, "quiz_ok", man, "クイズ正解")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#t-game", 500)
        tap(pg, "#category-list .cat-card >> nth=4", 600)
        tap(pg, "#game-type-select .big-option-btn >> nth=0", 2600)
        snap(pg, "karuta", man, "ゲーム:かるた")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#t-game", 500)
        tap(pg, "#category-list .cat-card >> nth=7", 600)
        tap(pg, "#game-type-select .big-option-btn >> nth=1", 600)
        tap(pg, ".player-btn >> nth=0", 1000)
        tap(pg, ".memory-card >> nth=2", 500)
        tap(pg, ".memory-card >> nth=9", 500)
        snap(pg, "memory", man, "ゲーム:神経衰弱")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#t-game", 500)
        tap(pg, "#category-list .cat-card >> nth=7", 600)
        tap(pg, "#game-type-select .big-option-btn >> nth=2", 1200)
        js(pg, "() => { const h = document.querySelector('.btn-hint-reveal'); h && h.click(); }", 700)  # 絵を出す
        word = pg.evaluate("() => (window.__spoken || '').replace(/\\s+/g,'').toLowerCase()")
        for ch in word[:max(1, len(word) - 1)]:
            pg.evaluate("""(ch) => { const b = [...document.querySelectorAll('#spell-pool .spell-char:not(.used)')]
                .find(b => b.innerText.trim().toLowerCase() === ch); b && b.click(); }""", ch)
            pg.wait_for_timeout(250)
        snap(pg, "spelling", man, f"ゲーム:スペル({word})")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".grade-btn.g3", 800)
        tap(pg, "#t-game", 500)
        tap(pg, "#category-list .cat-card >> nth=3", 600)
        tap(pg, "#game-type-select .big-option-btn >> nth=3", 600)
        tap(pg, "#bingo-size-select .nav-btn >> nth=0", 800)
        for i in range(9):
            pg.evaluate("() => { const c = document.querySelector('#bingo-pool .pool-card:not(.used)'); c && c.click(); }")
            pg.wait_for_timeout(120)
            pg.evaluate("(i) => document.querySelectorAll('#bingo-grid .bingo-cell')[i].click()", i)
            pg.wait_for_timeout(120)
        js(pg, "() => document.getElementById('btn-bingo-start').click()", 1000)
        for i in [0, 4, 8]:
            pg.evaluate("(i) => { const c = document.querySelectorAll('#bingo-grid .bingo-cell')[i]; c.click(); setTimeout(() => c.click(), 110); }", i)
            pg.wait_for_timeout(500)
        pg.wait_for_timeout(600)
        snap(pg, "bingo", man, "ゲーム:ビンゴ")
        pg.close()

        pg = fresh(ctx)
        tap(pg, ".speech-entry-btn", 900)
        tap(pg, ".speech-menu-actions .btn-add-sentence", 900)
        js(pg, "() => document.querySelector('#speech-tpl-say > *').click()", 900)  # I like ___.
        js(pg, """() => { const g = [...document.querySelectorAll('#speech-picker-grades > *')];
                 (g.find(c => c.textContent.includes('3')) || g[0])?.click(); }""", 700)
        js(pg, """() => { const g = [...document.querySelectorAll('#speech-picker-cats > *')];
                 (g.find(c => /sport/i.test(c.textContent)) || g[0])?.click(); }""", 700)
        js(pg, """() => { const g = [...document.querySelectorAll('#speech-word-grid > *')];
                 (g.find(c => /soccer/i.test(c.innerHTML)) || g[0])?.click(); }""", 900)
        snap(pg, "speech_build", man, "My Speech:文づくり")
        js(pg, "() => document.getElementById('btn-speech-save').click()", 2400)
        tap(pg, "#btn-present", 1500)
        snap(pg, "speech_present", man, "My Speech:発表モード")
        pg.close()
        b.close()

    (OUT / "manifest.json").write_text(json.dumps(man, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
