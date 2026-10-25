from zipfile import ZipFile
from xml.etree import ElementTree as E
import sys,json,re

ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
raw=open(sys.argv[2],encoding='utf-8').read()
model=json.loads(re.search(r'<script id="project-data"[^>]*>([\s\S]*?)</script>',raw)[1] if sys.argv[2].endswith('.html') else raw)
def text(sp):return ''.join(n.text or '' for n in sp.findall('.//a:t',ns))
def box(root,value):
    matches=[s for s in root.findall('.//p:sp',ns) if text(s)==value.replace('\n','')]
    assert len(matches)==1,(value,len(matches))
    return matches[0]
def top(sp):return int(sp.find('p:spPr/a:xfrm/a:off',ns).get('y'))+int(sp.find('p:txBody/a:bodyPr',ns).get('tIns','0'))
identities=rows=multiline=0
with ZipFile(sys.argv[1]) as deck:
    for index,page in enumerate(model['slides'],1):
        root=E.fromstring(deck.read(f'ppt/slides/slide{index}.xml'))
        if page.get('profileIdentity'):
            for key in ['legacy_3','legacy_4','legacy_5','legacy_6']:
                sp=box(root,page[key]);body=sp.find('p:txBody/a:bodyPr',ns)
                assert body.get('wrap')=='none',(key,page[key])
                assert len(sp.findall('p:txBody/a:p',ns))==len(page[key].split('\n')),'Only source manual breaks are allowed'
                width=int(sp.find('p:spPr/a:xfrm/a:ext',ns).get('cx'))
                assert width>170*12700,'Identity uses card inner width, not tight glyph width'
            identities+=1
        if page.get('referenceLayout')=='references':
            numbers=[sp for sp in root.findall('.//p:sp',ns) if re.fullmatch(r'\[\d+\]',text(sp))]
            assert numbers
            for number in numbers:
                serial=int(text(number)[1:-1]);content=box(root,page[f'legacy_{serial*2+3}'])
                for sp in [number,content]:
                    assert sp.find('p:txBody/a:bodyPr',ns).get('anchor')=='t','Top alignment must be explicit and supported'
                assert abs(top(number)-top(content))<100,'Number and first bibliography line must share top position'
                assert number.find('p:txBody/a:p/a:pPr/a:spcBef',ns) is None
                rows+=1
                multiline+=int(content.find('p:txBody/a:bodyPr',ns).get('wrap')=='square')
assert identities and rows and multiline
print(f'PASS {identities} identity cards allow only manual breaks; {rows} bibliography rows top-aligned including {multiline} wrapped entries')
