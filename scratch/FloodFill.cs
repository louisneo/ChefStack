using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

class Program {
    static void Main() {
        string inputPath = @"scratch/original_logo.png";
        string outputPath = @"assets/chefstack_logo.png";

        Bitmap bmp = new Bitmap(inputPath);
        int w = bmp.Width;
        int h = bmp.Height;

        bool[,] visited = new bool[w, h];
        Queue<Point> queue = new Queue<Point>();

        for (int x = 0; x < w; x++) {
            queue.Enqueue(new Point(x, 0));
            queue.Enqueue(new Point(x, h - 1));
        }
        for (int y = 0; y < h; y++) {
            queue.Enqueue(new Point(0, y));
            queue.Enqueue(new Point(w - 1, y));
        }

        while (queue.Count > 0) {
            Point pt = queue.Dequeue();
            int x = pt.X;
            int y = pt.Y;

            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            if (visited[x, y]) continue;
            visited[x, y] = true;

            Color c = bmp.GetPixel(x, y);
            if (c.R >= 200 && c.G >= 200 && c.B >= 200) {
                bmp.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));

                queue.Enqueue(new Point(x + 1, y));
                queue.Enqueue(new Point(x - 1, y));
                queue.Enqueue(new Point(x, y + 1));
                queue.Enqueue(new Point(x, y - 1));
            }
        }

        bmp.Save(outputPath, ImageFormat.Png);
        bmp.Dispose();
        Console.WriteLine("Outer white background removed successfully via C#.");
    }
}
