from pathlib import Path
from PIL import Image, ImageDraw
import sys
source=Path(sys.argv[1] if len(sys.argv)>1 else 'ect/lishui-pages')
target=Path(sys.argv[2] if len(sys.argv)>2 else 'ect/preview.png')
files=sorted(source.glob('*.png'))
columns=5; width=480; gap=14; label=26; height=270
rows=(len(files)+columns-1)//columns
canvas=Image.new('RGB',(columns*(width+gap)+gap,rows*(height+gap+label)+gap),'#e9f0f1')
d=ImageDraw.Draw(canvas)
for i,path in enumerate(files):
    image=Image.open(path).convert('RGB');image.thumbnail((width,height),Image.Resampling.LANCZOS)
    x=gap+(i%columns)*(width+gap);y=gap+(i//columns)*(height+gap+label)
    canvas.paste(image,(x,y));d.text((x,y+height+6),f'{i+1:02d} / {len(files)}',fill='#31565f')
target.parent.mkdir(parents=True,exist_ok=True);canvas.save(target)
print(target)
