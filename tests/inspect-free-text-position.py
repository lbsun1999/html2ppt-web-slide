from zipfile import ZipFile
from xml.etree import ElementTree as E
import sys,json
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
p=json.load(open(sys.argv[2],encoding='utf-8'));s=p['slides'][0];r=s['textPositions']['lead']
with ZipFile(sys.argv[1]) as z:
    root=E.fromstring(z.read('ppt/slides/slide1.xml'))
    candidates=[n for n in root.findall('.//p:sp',ns) if ''.join(t.text or '' for t in n.findall('.//a:t',ns))==s['lead'].replace('\n','')]
    assert len(candidates)==1
    off=candidates[0].find('p:spPr/a:xfrm/a:off',ns)
    assert abs(int(off.get('x'))/7620-r['x'])<.1
    assert abs(int(off.get('y'))/7620-r['y'])<.1
    assert candidates[0].find('.//a:normAutofit',ns) is None
    body=p['slides'][1];r=body['textPositions']['lead'];root=E.fromstring(z.read('ppt/slides/slide2.xml'))
    lead=[n for n in root.findall('.//p:sp',ns) if ''.join(t.text or '' for t in n.findall('.//a:t',ns))==body['lead']]
    assert len(lead)==1
    off=lead[0].find('p:spPr/a:xfrm/a:off',ns)
    assert abs(int(off.get('y'))/7620-r['y'])<.1
print('PASS moved page lead stays native text at its saved PPTX coordinates')
