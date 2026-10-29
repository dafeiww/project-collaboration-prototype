"""将网页入口打包为可直接打开、转发的单文件 HTML。"""

from pathlib import Path


root = Path(__file__).resolve().parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
script = (root / "script.js").read_text(encoding="utf-8")

stylesheet = next(line for line in html.splitlines() if 'href="styles.css?' in line)
script_tag = next(line for line in html.splitlines() if 'src="script.js?' in line)
html = html.replace(stylesheet, "  <style>\n" + css + "\n  </style>")
html = html.replace(script_tag, "  <script>\n" + script + "\n  </script>")

for filename in ["项目协作-可转发原型.html", "项目协作-可转发原型-成员列表修复.html"]:
    (root / filename).write_text(html, encoding="utf-8")
    print(f"已生成：{filename}")
