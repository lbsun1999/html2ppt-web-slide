"""Check style-specific native PPTX text, typography and separate decorations."""
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
with zipfile.ZipFile(root/'ect/text-styles-example.pptx') as z:
    pages=[n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')]
    assert len(pages)==10
    def slide(n): return ET.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
    def text(n): return '\n'.join(t.text or '' for t in slide(n).findall('.//a:t',ns))
    assert '研究板块 1' in text(5), 'B1 title must remain editable'
    assert len(slide(5).findall('.//p:pic',ns))>=6, 'B1 decorations should be separate images'
    assert '研究板块' not in text(8), 'C1 must not export hidden titles'
    assert '模块大标题' in text(9)
    props=slide(10).findall('.//a:rPr',ns)
    assert {1400,1600,1800}.issubset({int(p.attrib['sz']) for p in props if 'sz' in p.attrib})
    assert any(x.attrib.get('typeface')=='Georgia' for x in slide(10).findall('.//a:latin',ns))
    print('Verified 10-page PPTX: editable headings, separate artwork, hidden C1 titles, C2 heading, C3 14/16/18pt and serif numbers.')
