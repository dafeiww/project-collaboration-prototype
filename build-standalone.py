"""将网页入口打包为可直接打开、转发的单文件 HTML。"""

from pathlib import Path


root = Path(__file__).resolve().parent
html = (root / "index.html").read_text(encoding="utf-8")
for filename in ["styles.css", "analysis-result.css"]:
    css = (root / filename).read_text(encoding="utf-8")
    tag = next(line for line in html.splitlines() if f'href="{filename}?' in line)
    html = html.replace(tag, "  <style>\n" + css + "\n  </style>")
for filename in ["analysis-result.js", "script.js"]:
    script = (root / filename).read_text(encoding="utf-8")
    tag = next(line for line in html.splitlines() if f'src="{filename}?' in line)
    html = html.replace(tag, "  <script>\n" + script + "\n  </script>")

for filename in ["项目协作-可转发原型.html", "项目协作-可转发原型-成员列表修复.html"]:
    (root / filename).write_text(html, encoding="utf-8")
    print(f"已生成：{filename}")

demo_html = html.replace("<body>", '<body data-start-collaboration-analysis>')
for demo_filename in ["项目协作-多人分析演示.html", "collaboration-analysis.html"]:
    (root / demo_filename).write_text(demo_html, encoding="utf-8")
    print(f"已生成：{demo_filename}")
