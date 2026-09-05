using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public class CropHelper
{
    public static void CropAndMakeTransparent(string srcPath, string destPath, int x, int y, int w, int h, bool makeTransparent = true)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            Rectangle rect = new Rectangle(x, y, Math.Min(w, src.Width - x), Math.Min(h, src.Height - y));
            using (Bitmap cropped = src.Clone(rect, PixelFormat.Format32bppArgb))
            {
                if (makeTransparent)
                {
                    int width = cropped.Width;
                    int height = cropped.Height;
                    bool[,] visited = new bool[width, height];
                    Queue<Point> queue = new Queue<Point>();

                    for (int i = 0; i < width; i++)
                    {
                        queue.Enqueue(new Point(i, 0));
                        queue.Enqueue(new Point(i, height - 1));
                    }
                    for (int j = 0; j < height; j++)
                    {
                        queue.Enqueue(new Point(0, j));
                        queue.Enqueue(new Point(width - 1, j));
                    }

                    while (queue.Count > 0)
                    {
                        Point pt = queue.Dequeue();
                        int px = pt.X;
                        int py = pt.Y;

                        if (px < 0 || px >= width || py < 0 || py >= height) continue;
                        if (visited[px, py]) continue;
                        visited[px, py] = true;

                        Color col = cropped.GetPixel(px, py);
                        int r = col.R;
                        int g = col.G;
                        int b = col.B;

                        // Check if pixel is background (near white/off-white)
                        if (r >= 240 && g >= 240 && b >= 240)
                        {
                            cropped.SetPixel(px, py, Color.FromArgb(0, 255, 255, 255));

                            queue.Enqueue(new Point(px + 1, py));
                            queue.Enqueue(new Point(px - 1, py));
                            queue.Enqueue(new Point(px, py + 1));
                            queue.Enqueue(new Point(px, py - 1));
                        }
                        else if (r >= 225 && g >= 225 && b >= 225)
                        {
                            // Soft edge anti-aliasing feathering
                            int lum = r + g + b;
                            int alpha = (int)(255.0 * (765 - lum) / (765 - 675));
                            if (alpha < 0) alpha = 0;
                            if (alpha > 255) alpha = 255;
                            cropped.SetPixel(px, py, Color.FromArgb(alpha, r, g, b));
                        }
                    }
                }

                string dir = Path.GetDirectoryName(destPath);
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                cropped.Save(destPath, ImageFormat.Png);
            }
        }
    }
}
