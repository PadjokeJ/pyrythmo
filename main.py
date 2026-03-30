from PIL import Image, ImageDraw, ImageFont
from ffmpeg import FFmpeg

import os

PERCENT_PER_SEC = 0.22

colors = [
    (180, 50, 50),
    (50, 180, 50),
    (50, 50, 180),
    (180, 50, 180),
    (180, 180, 50)
]

def load_rythmo(path):
    lines = []
    w = 0
    h = 0
    speakers = 0
    with open(path, 'r', encoding="utf-8") as f:
        w = f.readline()
        h = f.readline()
        length = f.readline()
        speakers = f.readline()

        names = []
        for i in range(int(speakers)):
            names.append(f.readline().strip())

        print(names)
        
        l = f.readlines()
        for line in l:
            lines.append(line)
    
    
    data = {
        "width"     : int(w),
        "height"    : int(h),
        "speakers"  : int(speakers),
        "lines"     : lines,
        "names"     : names,
        "length"    : int(length)
    }
    
    return data

def parse_rythmo(data):
    w = data["width"]
    h = data["height"]
    s = data["speakers"]
    l = data["lines"]
    n = data["names"]
    
    rythmo = []
    
    for line in l:
        if line == "\n":
            continue
        speaker = n.index(line.split(':')[1])
        time    = int(line.split(':')[0])
        text    = line[line.find(':', line.find(':') + 1, len(line) - 1) + 1 :-1]
        
        rythmo.append({
            "speaker" : speaker,
            "time"    : time / 100.0,
            "text"    : text
        })
    
    return rythmo
        
        

def gen_rythmo(w, h, n):
    img = Image.new("RGB", (w, h), (255, 255, 255))
    pix = img.load()
    s = h//n
    
    for i in range(1, n):
        for x in range(w):
            pix[x, i * s] = (0, 0, 0)
            pix[x, i * s + 1] = (0, 0, 0)
    
    for y in range(h):
        pix[w // 8, y] = (0, 0, 0)
        pix[w // 8 + 1, y] = (0, 0, 0)
    
    return img

def rythmo_anim(lines, base, w, h, s, vidl, path):
    global PERCENT_PER_SEC
    font = ImageFont.load_default(25)
    #font = ImageFont.truetype("arial.ttf", 160 / s)
    c = colors

    t = 0
    i = 0

    while True:
        img = base.copy()
        draw = ImageDraw.Draw(img)
        t += 1 / 30.0
        for l in lines:
            x = (l["time"] - t) * PERCENT_PER_SEC * w + (w // 8)
            y = l["speaker"] / s * h
            if (x > w) or (x < -w): continue

            draw.text((x, y), l["text"], c[l["speaker"]], font)
        img.save("out" + path + "/img" + str(i).zfill(5) + ".bmp", format="bmp")

        i += 1

        if (t > vidl):
            break
        
def load_and_run(name):
    os.mkdir("out" + name)
    data = load_rythmo(name)
    w = data["width"]
    h = data["height"]
    s = data["speakers"]

    rythmo = parse_rythmo(data)
    base = gen_rythmo(w, h, s)
    rythmo_anim(rythmo, base, w, h, s, data["length"], name)

    ffmpeg = FFmpeg().option("y").input("out"+name+"/img%05d.bmp").output(name + ".mp4", {"codec:v": "libx264"}, r=30, pix_fmt="yuv420p", framerate=30)
    ffmpeg.execute()


if __name__ == "__main__":
    data = load_rythmo("test.ry")
    
    w = data["width"]
    h = data["height"]
    s = data["speakers"]
    
    rythmo = parse_rythmo(data)
    base = gen_rythmo(w, h, s)
    
    base.save("t.png")

    rythmo_anim(rythmo, base, w, h, s, 20, "test")
