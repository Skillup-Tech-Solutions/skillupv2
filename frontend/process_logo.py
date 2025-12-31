from PIL import Image
import os

img_path = '/Users/syed.ahamed/Downloads/project/skillupv2/frontend/android/app/src/main/res/drawable/brand_logo.png'
img = Image.open(img_path).convert("RGBA")
datas = img.getdata()

newData = []
# If the pixel is white (higher than 240) and opaque, make it transparent
for item in datas:
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save(img_path, "PNG")
print("Process completed: White background replaced with transparency.")
