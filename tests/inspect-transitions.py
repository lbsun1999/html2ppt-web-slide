import json
import sys
from zipfile import ZipFile
from xml.etree import ElementTree as E

ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
with open(sys.argv[2], encoding='utf-8') as f:
    project = json.load(f)
with ZipFile(sys.argv[1]) as deck:
    for i, model in enumerate(project['slides'], 1):
        root = E.fromstring(deck.read(f'ppt/slides/slide{i}.xml'))
        boxes = root.findall('.//p:sp', ns)
        text = lambda sp: ''.join(n.text or '' for n in sp.findall('.//a:t', ns))
        title, = [sp for sp in boxes if text(sp) == model['title'].replace('\n', '')]
        number, = [sp for sp in boxes if text(sp) == str(i).zfill(2)]
        for sp in (title, number):
            assert sp.find('p:txBody/a:bodyPr', ns).get('wrap') == 'none'
            assert sp.find('.//a:normAutofit', ns) is None
            assert sp.find('.//a:spAutoFit', ns) is None
            size = sp.find('p:spPr/a:xfrm/a:ext', ns)
            offset = sp.find('p:spPr/a:xfrm/a:off', ns)
            assert int(size.get('cx')) >= 9753500, 'Use the full title safe width, not the browser glyph width'
            assert abs(int(offset.get('x')) - 1219200) < 100
        assert len(title.findall('p:txBody/a:p', ns)) == len(model['title'].split('\n'))
        assert title.find('.//a:pPr', ns).get('algn') == 'ctr'
print('PASS native PPTX transition titles and numbers never wrap; wide centered boxes; only explicit manual line breaks')
