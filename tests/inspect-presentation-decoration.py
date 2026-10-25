from PIL import Image,ImageChops,ImageStat
from pathlib import Path
import sys

root=Path(sys.argv[1])
for style in ['ribbon','arrow','group']:
    direct=Image.open(root/(style+'-direct.png')).convert('RGB')
    audience=Image.open(root/(style+'-audience.png')).convert('RGB')
    assert direct.size==audience.size,(style,direct.size,audience.size)
    delta=ImageChops.difference(direct,audience)
    mean=sum(ImageStat.Stat(delta).mean)/3
    assert mean<0.1,(style,'Fullscreen and presenter views differ',mean)
    print(f'PASS {style} direct fullscreen vs audience screenshot: mean channel difference {mean:.5f}')
