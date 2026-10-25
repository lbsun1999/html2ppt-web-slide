from zipfile import ZipFile
from xml.etree import ElementTree as E
import sys

ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def text(sp):return ''.join(n.text or '' for n in sp.findall('.//a:t',ns))
def box(root,value):
    found=[sp for sp in root.findall('.//p:sp',ns) if text(sp)==value]
    assert len(found)==1,(value,len(found))
    return found[0]
def nowrap(sp):
    assert sp.find('p:txBody/a:bodyPr',ns).get('wrap')=='none',text(sp)
    assert sp.find('.//a:normAutofit',ns) is None

with ZipFile(sys.argv[1]) as deck:
    slides=[E.fromstring(deck.read(f'ppt/slides/slide{i}.xml')) for i in range(1,6)]
    for root in slides:
        for para in root.findall('.//p:sp/p:txBody/a:p',ns):
            props=para.findall('a:pPr',ns)
            assert len(props)==1,'Rich runs must not produce duplicate paragraph properties'
            for attr,value in [('eaLnBrk','1'),('latinLnBrk','0'),('hangingPunct','1')]:assert props[0].get(attr)==value
        for run in root.findall('.//p:sp/p:txBody/a:p/a:r/a:rPr',ns):assert run.get('lang')=='zh-CN'
    for i,title,lead in [(0,'封面标题，保留标点。','封面说明保持完整，句号不挤到下一行。'),(1,'研究方法与实现。实验验证与分析。','过渡页说明保持完整，句号不挤到下一行。'),(4,'感谢聆听，恳请批评指正。','欢迎提出建议，后续持续完善。')]:
        for value in [title,lead]:nowrap(box(slides[i],value))
    assert len(box(slides[1],'研究方法与实现。实验验证与分析。').findall('p:txBody/a:p',ns))==2
    body=slides[2]
    heading=box(body,'普通段落与原生列表');nowrap(heading)
    assert len(heading.findall('p:txBody/a:p',ns))==2,'Module titles preserve explicit semantic line breaks'
    for value in ['页首句末尾的句号留在本行。','脚注与来源必须单行， 保留完整文字。','来源说明：可点击的网页链接。','03 / 5','页尾总结保持单行，末尾句号不另起一行。']:nowrap(box(body,value))
    assert box(body,'来源说明：可点击的网页链接。').find('.//a:hlinkClick',ns) is not None
    plain=box(body,'这是一段普通说明。');assert plain.find('.//a:buChar',ns) is None
    for value,marker in [('选中文字可独立加粗。','•'),('这一项采用箭头符号。','➢')]:
        sp=box(body,value);bullet=sp.find('p:txBody/a:p/a:pPr/a:buChar',ns)
        assert bullet is not None and bullet.get('char')==marker
        assert not text(sp).startswith(marker),'Native bullet must not also be a literal text prefix'
        props=sp.find('p:txBody/a:p/a:pPr',ns);assert int(props.get('marL'))>0 and int(props.get('indent'))<0
    bold=box(body,'选中文字可独立加粗。').findall('.//a:r',ns)
    highlight=[r for r in bold if r.find('a:t',ns).text=='独立加粗'][0]
    assert highlight.find('a:rPr',ns).get('b')=='1'
    assert highlight.find('a:rPr/a:solidFill/a:srgbClr',ns).get('val')=='A31418'
    long=[sp for sp in body.findall('.//p:sp',ns) if text(sp).startswith('正文保留自然换行')][0]
    assert long.find('p:txBody/a:bodyPr',ns).get('wrap')=='square','Long prose must retain natural wrapping'
    nowrap(box(slides[3],'作者姓名'))
print('PASS single-line fields, manual title breaks, Chinese punctuation rules, native mixed bullets, rich text and editable multiline prose')
