# 24_6_□
![](art/art.png)

### How to generate video
```
ffmpeg -framerate 90 -start_number 0000 -i img_1_%04d.png -vcodec libx264 -pix_fmt yuv420p -r 90 -vf "scale=-2:1080" out.mp4
```
