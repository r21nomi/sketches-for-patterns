# 09_-o-o-o-
![](./art/art.png)

### How to generate video
```
ffmpeg -r 60 -start_number 0001 -i img_1_%04d.png -vcodec libx264 -pix_fmt yuv420p -r 60 out.mp4
```