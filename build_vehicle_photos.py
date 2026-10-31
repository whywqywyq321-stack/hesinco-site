#!/usr/bin/env python3
# 从王力公告(cn-truck.com)按车型型号下载真车照，按型号存入 assets/images/vehicles/{model}/
# 顺序下载 + 共享 cookie jar（规避服务器 307 限流），已存在的文件跳过（可多轮补满）。
import re, os, glob, io, subprocess, tempfile, time

SITE = "/Users/why/WorkBuddy/2026-10-31-10-04-29/hesinco-site"
DATA = os.path.join(SITE, "assets/data.js")
HTML_DIR = "/Users/why/WorkBuddy/2026-10-31-10-04-29/lingyang_data/html"
OUT_ROOT = os.path.join(SITE, "assets/images/vehicles")
CAP = 4
MAX_W = 1000
QUALITY = 80
COOKIE = os.path.join(SITE, ".cn_cookie.txt")

def get_models():
    s = open(DATA, encoding="utf-8").read()
    return re.findall(r'"announcement_model":\s*"([^"]+)"', s)

def html_for(model):
    f = os.path.join(HTML_DIR, model + ".html")
    if os.path.exists(f):
        return f
    cand = glob.glob(os.path.join(HTML_DIR, model + "*.html"))
    return cand[0] if cand else None

def img_urls(html_file):
    s = open(html_file, encoding="utf-8", errors="ignore").read()
    urls = re.findall(r'src="(https?://(img|source)\.cn-truck\.com/[^"]+\.(?:jpeg|jpg))"', s)
    seen, out = set(), []
    for u, _ in urls:
        if u not in seen:
            seen.add(u); out.append(u)
    return out

def fetch(u, tries=5):
    last = None
    for _ in range(tries):
        for proto in ("http", "https"):
            uu = u.replace("http://", proto + "://")
            try:
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tf:
                    tmp = tf.name
                # 顺序、带 cookie jar、不跟重定向(避免 307 死循环)；优先 http
                r = subprocess.run(
                    ["curl", "-s", "--max-time", "25", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                     "-e", "http://www.cn-truck.com/", "-b", COOKIE, "-c", COOKIE,
                     "-o", tmp, uu],
                    capture_output=True)
                if r.returncode == 0 and os.path.getsize(tmp) > 2000:
                    with open(tmp, "rb") as fh:
                        data = fh.read()
                    os.unlink(tmp)
                    return data
                os.unlink(tmp)
                last = Exception("rc=%d size small" % r.returncode)
            except Exception as e:
                last = e
        time.sleep(0.8)
    raise last

def process(model):
    hf = html_for(model)
    if not hf:
        return
    urls = img_urls(hf)[:CAP]
    d = os.path.join(OUT_ROOT, model)
    os.makedirs(d, exist_ok=True)
    for i, u in enumerate(urls, 1):
        fn = os.path.join(d, f"{i:02d}.jpg")
        if os.path.exists(fn) and os.path.getsize(fn) > 2000:
            continue  # 已下载，跳过
        try:
            raw = fetch(u)
            from PIL import Image
            im = Image.open(io.BytesIO(raw)).convert("RGB")
            if im.width > MAX_W:
                h = int(im.height * MAX_W / im.width)
                im = im.resize((MAX_W, h), Image.LANCZOS)
            im.save(fn, "JPEG", quality=QUALITY, optimize=True)
        except Exception as e:
            print(f"  ! {model} img{i} 失败: {e}")

def build_mapping():
    import json
    mapping = {}
    if not os.path.isdir(OUT_ROOT):
        return mapping
    for model in os.listdir(OUT_ROOT):
        d = os.path.join(OUT_ROOT, model)
        if not os.path.isdir(d):
            continue
        files = sorted(f for f in os.listdir(d) if f.endswith(".jpg") and os.path.getsize(os.path.join(d, f)) > 2000)
        if files:
            mapping[model] = ["assets/images/vehicles/" + model + "/" + f for f in files]
    return mapping

def main():
    models = get_models()
    print(f"车型总数: {len(models)}")
    done = 0
    for m in models:
        process(m)
        done += 1
        if done % 20 == 0:
            print(f"进度 {done}/{len(models)}")
    mapping = build_mapping()
    out = os.path.join(SITE, "assets/vehicle_photos.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("// 车型型号 -> 本地真车照路径（由王力公告页本地化生成，2026-10-31）\n")
        f.write("window.HESIN_VEHICLE_PHOTOS = ")
        f.write(repr(mapping))
        f.write(";\n")
    total = sum(len(v) for v in mapping.values())
    print(f"完成：{len(mapping)} 款有图，共 {total} 张。映射写入 {out}")

if __name__ == "__main__":
    main()
