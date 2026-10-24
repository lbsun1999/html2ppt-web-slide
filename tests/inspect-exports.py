"""Verify OOXML editability/media and create a PDF contact sheet after e2e tests."""
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]
out=root/'ect'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(out/'example.pptx') as z:
    pages=sorted(n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml'))
    assert len(pages)==6, len(pages)
    texts=[]
    for name in pages:
        tree=ET.fromstring(z.read(name))
        texts.extend(t.text or '' for t in tree.findall('.//a:t',ns))
    assert any('研究背景' in t for t in texts)
    assert any('00.00' in t for t in texts)
    assert len(texts)>60, len(texts)
    assert any(n.endswith('.mp4') for n in z.namelist()), 'No embedded video'
    assert len([n for n in z.namelist() if n.startswith('ppt/media/')])>6
    presentation=ET.fromstring(z.read('ppt/presentation.xml'))
    size=presentation.find('p:sldSz',ns)
    assert abs(int(size.attrib['cx'])/int(size.attrib['cy'])-16/9)<1e-5
    print(f'PPTX verified: {len(pages)} slides, {len(texts)} editable text elements, embedded MP4, 16:9.')
images=sorted(out.glob('pdf-check-*.png'))
if images:
    canvas=Image.new('RGB',(1920,800),'#e7edf2')
    draw=ImageDraw.Draw(canvas)
    for i,p in enumerate(images):
        im=Image.open(p).convert('RGB');im.thumbnail((610,344))
        x=20+(i%3)*636;y=18+(i//3)*392
        canvas.paste(im,(x,y));draw.text((x,y+352),str(i+1),fill='#12374e')
    canvas.save(out/'export-preview.png')
