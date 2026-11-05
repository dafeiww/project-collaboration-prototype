"""将网页入口打包为可直接打开、转发的单文件 HTML。

响应式版：保留手机版式，窗口变窄时自动切换。
桌面版：去掉窄屏媒体查询，始终按电脑端布局展示，窗口过窄时横向滚动。
"""

from pathlib import Path

root = Path(__file__).resolve().parent
CSS_FILES = ["styles.css", "analysis-result.css"]
JS_FILES = ["analysis-result.js", "script.js"]

DESKTOP_CSS = """
/* 桌面版：始终按电脑端布局展示，不切换到手机版式；窗口窄于 1280 时横向滚动。 */
html,body{min-width:1280px}
.app-shell{min-width:1280px}
"""


def strip_narrow_media(css: str) -> str:
    """删除 max-width 媒体查询，保留 min-width、max-height 与动效偏好设置。"""
    out, i = [], 0
    while True:
        start = css.find("@media", i)
        if start == -1:
            out.append(css[i:])
            break
        open_brace = css.index("{", start)
        depth, end = 0, open_brace
        while end < len(css):
            if css[end] == "{":
                depth += 1
            elif css[end] == "}":
                depth -= 1
                if depth == 0:
                    break
            end += 1
        prelude = css[start:open_brace]
        if "max-width" in prelude:
            out.append(css[i:start])
        else:
            out.append(css[i:end + 1])
        i = end + 1
    return "".join(out)


def bundle(transform_css=lambda css: css, extra_css: str = "", desktop_viewport: bool = False) -> str:
    html = (root / "index.html").read_text(encoding="utf-8")
    if desktop_viewport:
        html = html.replace('content="width=device-width, initial-scale=1"', 'content="width=1280"')
    for filename in CSS_FILES:
        css = transform_css((root / filename).read_text(encoding="utf-8"))
        tag = next(line for line in html.splitlines() if f'href="{filename}?' in line)
        html = html.replace(tag, "  <style>\n" + css + "\n  </style>")
    for filename in JS_FILES:
        script = (root / filename).read_text(encoding="utf-8")
        tag = next(line for line in html.splitlines() if f'src="{filename}?' in line)
        html = html.replace(tag, "  <script>\n" + script + "\n  </script>")
    if extra_css:
        html = html.replace("</head>", "  <style>\n" + extra_css + "\n  </style>\n</head>")
    return html


responsive = bundle()
for filename in ["项目协作-可转发原型.html", "项目协作-可转发原型-成员列表修复.html"]:
    (root / filename).write_text(responsive, encoding="utf-8")
    print(f"已生成：{filename}")

demo = responsive.replace("<body>", "<body data-start-collaboration-analysis>")
for filename in ["项目协作-多人分析演示.html", "collaboration-analysis.html"]:
    (root / filename).write_text(demo, encoding="utf-8")
    print(f"已生成：{filename}")

desktop = bundle(transform_css=strip_narrow_media, extra_css=DESKTOP_CSS, desktop_viewport=True)
for filename in ["项目协作.html"]:
    (root / filename).write_text(desktop, encoding="utf-8")
    print(f"已生成：{filename}")

desktop_demo = desktop.replace("<body>", "<body data-start-collaboration-analysis>")
for filename in ["项目协作-多人分析演示-桌面版.html"]:
    (root / filename).write_text(desktop_demo, encoding="utf-8")
    print(f"已生成：{filename}")
