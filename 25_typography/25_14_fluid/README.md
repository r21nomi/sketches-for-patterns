# 25_14_fluid
![](art/art.png)

### How to generate video
```
ffmpeg -framerate 60 -start_number 0000 -i img_1_%04d.png -vcodec libx264 -pix_fmt yuv420p -r 60 -vf "scale=-2:1080" out.mp4
```
