from zipfile import ZipFile
from pathlib import Path
import json, re, sys
import xml.etree.ElementTree as ET

ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
deck=Path(sys.argv[1]);source=Path(sys.argv[2]);raw=source.read_text(encoding='utf-8')
project=json.loads(re.search(r'<script id="project-data"[^>]*>([\s\S]*?)</script>',raw)[1] if source.suffix=='.html' else raw)
def rect(s):
 x=s.find('p:spPr/a:xfrm',ns)
 if x is None:return None
 off=x.find('a:off',ns);ext=x.find('a:ext',ns)
 return tuple(int(v) for v in (off.get('x'),off.get('y'),ext.get('cx'),ext.get('cy')))
headers=0;summaries=0
with ZipFile(deck) as z:
 for i,page in enumerate(project['slides']):
  root=ET.fromstring(z.read(f'ppt/slides/slide{i+1}.xml'));shapes=root.findall('.//p:sp',ns)
  for m in page.get('modules',[]):
   if m.get('type')!='text' or m.get('style')!='band' or m.get('showTitle') is False:continue
   for part in m['parts']:
    title=part['title'];texts=[s for s in shapes if ''.join(t.text or '' for t in s.findall('.//a:t',ns))==title]
    assert texts, f'A3 title missing: {title}'
    tx,ty,tw,th=rect(texts[0]);found=False
    for bg in shapes:
     color=bg.find('p:spPr/a:solidFill/a:srgbClr',ns);r=rect(bg)
     if color is None or r is None or color.get('val').lower()!=project['theme']['primary'].lstrip('#').lower():continue
     x,y,w,h=r
     if x<=tx+100 and y<=ty+100 and x+w>=tx+tw-100 and y+h>=ty+th-100 and h<914400:found=True
    assert found,f'A3 native background missing: {title}'
    headers+=1
  summary=page.get('summary','')
  if summary:
   texts=[s for s in shapes if ''.join(t.text or '' for t in s.findall('.//a:t',ns))==summary]
   assert texts,f'Summary missing on page {i+1}'
   box=texts[0];body=box.find('p:txBody/a:bodyPr',ns)
   assert body is not None and body.get('wrap')=='none',f'Summary wraps on page {i+1}'
   assert len(box.findall('p:txBody/a:p',ns))==1,'Summary is split into multiple paragraphs'
   assert abs(rect(box)[2]-1440*7620)<50,'Summary must use the full inner width, not a tight glyph width'
   summaries+=1
print(f'PASS {deck.name}: {headers} A3 backgrounds and {summaries} single-line summaries with full text width')
