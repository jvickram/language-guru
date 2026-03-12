from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 1000
img = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(img)

try:
    f_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 24)
    f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 16)
    f_b = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
except Exception:
    f_title = f = f_b = ImageFont.load_default()

d.text((30, 20), 'Language Guru - Application Model Diagram', fill='#102a43', font=f_title)

def box(x, y, w, h, text, fill, outline='#333', bold=False):
    d.rounded_rectangle((x, y, x + w, y + h), radius=12, fill=fill, outline=outline, width=2)
    font = f_b if bold else f
    ty = y + 12
    for line in text.split('\n'):
        d.text((x + 12, ty), line, fill='#102a43', font=font)
        ty += 20

def arrow(x1, y1, x2, y2, color='#4a5568'):
    import math
    d.line((x1, y1, x2, y2), fill=color, width=3)
    ang = math.atan2(y2 - y1, x2 - x1)
    L = 12
    a1 = ang + 2.6
    a2 = ang - 2.6
    d.polygon([
        (x2, y2),
        (x2 + L * math.cos(a1), y2 + L * math.sin(a1)),
        (x2 + L * math.cos(a2), y2 + L * math.sin(a2)),
    ], fill=color)

box(560, 80, 320, 90, 'Mobile App (React Native)\nApp.js + Navigation', '#dae8fc', '#6c8ebf', True)
box(210, 230, 230, 90, 'Splash Screen\nSession Bootstrap', '#e1d5e7', '#9673a6')
box(470, 230, 230, 90, 'Login Screen\nAuth + Role Selection', '#e1d5e7', '#9673a6')
box(730, 230, 260, 90, 'Home Screen\nTracks + Quiz + Simulation', '#e1d5e7', '#9673a6')
box(560, 360, 320, 95, 'Redux Store\nAuth / Lessons / Progress', '#fff2cc', '#d6b656', True)
box(930, 375, 250, 70, 'API Config\n10.0.2.2:3000/api', '#f8cecc', '#b85450')
box(560, 510, 320, 90, 'Backend (Node.js/Express)\nserver.js', '#d5e8d4', '#82b366', True)
box(190, 660, 250, 90, '/api/auth\nregister, login', '#d5e8d4', '#82b366')
box(490, 660, 260, 90, '/api/lessons\ntrack lessons + quiz', '#d5e8d4', '#82b366')
box(790, 660, 260, 90, '/api/progress\nsubmit + fetch', '#d5e8d4', '#82b366')
box(1110, 650, 300, 110, 'In-Memory Data\nUsers, Lessons, Progress', '#ffe6cc', '#d79b00', True)

arrow(720, 170, 325, 230)
arrow(720, 170, 585, 230)
arrow(720, 170, 860, 230)
arrow(325, 320, 650, 360)
arrow(585, 320, 700, 360)
arrow(860, 320, 780, 360)
arrow(880, 405, 930, 410, '#b85450')
arrow(1180, 410, 880, 555, '#b85450')
arrow(650, 600, 315, 660)
arrow(720, 600, 620, 660)
arrow(790, 600, 920, 660)
arrow(440, 705, 1110, 705)
arrow(750, 705, 1110, 705)
arrow(1050, 705, 1110, 705)

img.save('architecture-model.png', 'PNG')
print('saved architecture-model.png')
