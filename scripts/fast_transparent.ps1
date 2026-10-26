$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageTransparency
{
    public static void RemoveBackground(string inputPath, string outputPath, int threshold)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int width = src.Width;
            int height = src.Height;

            Bitmap dst = new Bitmap(width, height, PixelFormat.Format32bppArgb);

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = dst.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int bytes = Math.Abs(srcData.Stride) * height;
            byte[] srcRgba = new byte[bytes];
            byte[] dstRgba = new byte[bytes];

            Marshal.Copy(srcData.Scan0, srcRgba, 0, bytes);
            src.UnlockBits(srcData);

            bool[] isBg = new bool[width * height];
            Queue<int> queue = new Queue<int>();

            // Check if pixel is dark
            Func<int, bool> isDark = (idx) => {
                int b = srcRgba[idx * 4];
                int g = srcRgba[idx * 4 + 1];
                int r = srcRgba[idx * 4 + 2];
                return r <= threshold && g <= threshold && b <= threshold;
            };

            // Seed 4 edges
            for (int x = 0; x < width; x++)
            {
                int topIdx = x;
                if (!isBg[topIdx] && isDark(topIdx)) { isBg[topIdx] = true; queue.Enqueue(topIdx); }
                int botIdx = (height - 1) * width + x;
                if (!isBg[botIdx] && isDark(botIdx)) { isBg[botIdx] = true; queue.Enqueue(botIdx); }
            }
            for (int y = 0; y < height; y++)
            {
                int leftIdx = y * width;
                if (!isBg[leftIdx] && isDark(leftIdx)) { isBg[leftIdx] = true; queue.Enqueue(leftIdx); }
                int rightIdx = y * width + (width - 1);
                if (!isBg[rightIdx] && isDark(rightIdx)) { isBg[rightIdx] = true; queue.Enqueue(rightIdx); }
            }

            // BFS Flood Fill
            int[] dx = { 0, 0, 1, -1 };
            int[] dy = { 1, -1, 0, 0 };

            while (queue.Count > 0)
            {
                int curr = queue.Dequeue();
                int cx = curr % width;
                int cy = curr / width;

                for (int i = 0; i < 4; i++)
                {
                    int nx = cx + dx[i];
                    int ny = cy + dy[i];
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height)
                    {
                        int nIdx = ny * width + nx;
                        if (!isBg[nIdx] && isDark(nIdx))
                        {
                            isBg[nIdx] = true;
                            queue.Enqueue(nIdx);
                        }
                    }
                }
            }

            // Fill dst
            for (int p = 0; p < width * height; p++)
            {
                int bIdx = p * 4;
                if (isBg[p])
                {
                    dstRgba[bIdx] = 0;
                    dstRgba[bIdx + 1] = 0;
                    dstRgba[bIdx + 2] = 0;
                    dstRgba[bIdx + 3] = 0; // Alpha = 0
                }
                else
                {
                    dstRgba[bIdx] = srcRgba[bIdx];
                    dstRgba[bIdx + 1] = srcRgba[bIdx + 1];
                    dstRgba[bIdx + 2] = srcRgba[bIdx + 2];
                    dstRgba[bIdx + 3] = 255; // Alpha = 255
                }
            }

            Marshal.Copy(dstRgba, 0, dstData.Scan0, bytes);
            dst.UnlockBits(dstData);

            dst.Save(outputPath, ImageFormat.Png);
            dst.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

[ImageTransparency]::RemoveBackground(
    "C:\Users\PC\.gemini\antigravity-ide\brain\4233b952-4ec7-4981-99a4-4e7323a42a3b\male_receiver_fixed_1793023935757.jpg",
    "d:\ProjectFE3D\project-3d-fe\public\images\characters\male_receiver.png",
    12
)
Write-Host "Male receiver transparent PNG regenerated with intact hair!"

[ImageTransparency]::RemoveBackground(
    "C:\Users\PC\.gemini\antigravity-ide\brain\4233b952-4ec7-4981-99a4-4e7323a42a3b\female_sniper_anime_1793023427114.jpg",
    "d:\ProjectFE3D\project-3d-fe\public\images\characters\female_sniper.png",
    25
)
Write-Host "Female sniper transparent PNG generated!"
