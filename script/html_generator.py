import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_DIR = BASE_DIR / "bg" # 이미지 폴더
    
OUTPUT_FILE = "index.html"   # ⬅ 상위 폴더로 출력

VALID_EXT = (".jpg", ".jpeg", ".png", ".webp")
# 지원 확장자
VALID_EXT = (".jpg", ".jpeg", ".png", ".webp")


def get_image_files():
    files = [f for f in os.listdir(IMAGE_DIR)
             if f.lower().endswith(VALID_EXT)]
    files.sort(key=lambda x: int(os.path.splitext(x)[0]))
    return files


def make_pages(files):
    html = ""
    for i, filename in enumerate(files, start=1):
        html += f'''
            <div id="page{i}" class="center-img disabled" style="display: none;">
                <img id="book{i}" src="bg/{filename}" class="book-img">
            </div>
        '''
    return html

image_files = get_image_files()
TOTAL_PAGES = len(image_files)
page_blocks = make_pages(image_files)

html = f'''
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="generator" content="pdf2htmlEX"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:url" content="https://sungwoon129.github.io/themove-12/">
<meta property="og:title" content="THE MOVE 2026. 1월호">         
<meta property="og:type" content="website">
<meta property="og:image" content="thumb/thumb.png">
<meta property="og:description" content="세상을 움직여라! 월간 더무브">
<title></title>
<link rel="stylesheet" href="custom_style.css"/>
</head>
<body>
<div id="bg">
    <div id="loader">
        <div class="spinner"></div>
    </div>
<div id="page-container">

<div id="left-sidebar">
<div class="controller">
        <div id="start"><img src="icon/start.png"></div>
        <div id="prev"><img src="icon/iconmonstr-caret-left-filled-120.png"></div>
</div>
</div>
<div id="masked-page">
    <div id="page-wrap">
        {page_blocks}
    </div>
    <div id="play-icon">
        <img src="icon/play.png">
    </div>    
</div>
<div id="right-sidebar"><div class="controller">
<div id="end"><img src="icon/end.png"></div>
<div id="next">
<img src="icon/iconmonstr-caret-right-filled-120.png">
</div></div></div>
</div>

<div id="thumbnails"></div>

<div id="navigator">
    <div id="pageNavi">
        
    </div>

    <div id="content">
        <input type="text" id="pageSelector">
        <span id="divider">/</span>
        <span id="pagelength">{TOTAL_PAGES}</span>
    </div>
</div>
</div>
<script src="custom.js" type="module"></script>
</body>
</html>
'''

with open(OUTPUT_FILE, "w+", encoding="utf-8") as f:
    f.write(html)


print(f"파일 이름: {OUTPUT_FILE}")
print(f"HTML 생성 완료! 총 페이지 수: {TOTAL_PAGES}")