import sys
import zipfile
import xml.etree.ElementTree as ET

ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
path, primary = sys.argv[1:]
with zipfile.ZipFile(path) as deck:
    for i in range(1, 4):
        root = ET.fromstring(deck.read(f'ppt/slides/slide{i}.xml'))
        texts = [(sp, ''.join(sp.itertext())) for sp in root.findall('.//p:sp', ns) if sp.find('p:txBody', ns) is not None]
        # Editable text must remain present as individual native textboxes.
        title, = [sp for sp, text in texts if text == '研究背景与问题定义']
        assert title.find('.//a:srgbClr', ns).get('val') == primary.upper()
        expected = ['研究背景', '研究 方法', None][i-1]
        chapter, = [sp for sp, text in texts if text == expected or (expected is None and text.endswith('…'))]
        assert chapter.find('p:txBody/a:bodyPr', ns).get('wrap') == 'none'
        assert chapter.find('.//a:br', ns) is None
        assert chapter.find('.//a:normAutofit', ns) is None
        # Keep a wide native text area and stay to the left of the logo.
        xfrm = chapter.find('p:spPr/a:xfrm', ns)
        x = int(xfrm.find('a:off', ns).get('x'))
        width = int(xfrm.find('a:ext', ns).get('cx'))
        assert width > 5 * 914400
        assert x + width <= 1392 / 120 * 914400 + 2
print(f'PASS {primary}: 3 native PPTX chapter labels never wrap; page titles use theme color; long labels fit with ellipsis')
