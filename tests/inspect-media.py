import sys, zipfile, xml.etree.ElementTree as E
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
    root=E.fromstring(z.read('ppt/slides/slide1.xml'))
    pictures=root.findall('.//p:pic',ns)
    assert len(pictures)==3, len(pictures)
    dimensions=[pic.find('p:spPr/a:xfrm/a:ext',ns).attrib for pic in pictures]
    heights=[int(d['cy']) for d in dimensions]
    assert max(heights)-min(heights)<=128, heights
    ratios=[1.5,2.35,4/3]
    for d,ratio in zip(dimensions,ratios):
        assert abs(int(d['cx'])/int(d['cy'])-ratio)<.001
    assert any(n.endswith('.mp4') for n in z.namelist())
print('PASS native PPTX media: equal absolute heights, preserved aspect ratios, embedded video')
