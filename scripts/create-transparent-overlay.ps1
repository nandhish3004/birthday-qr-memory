# ==============================================================================
# Generate Transparent Polaroid Frame Overlay for Shaaaw's Scrapbook Poster
# ==============================================================================
param(
    [string]$TargetDir = ""
)

Add-Type -AssemblyName System.Drawing

if (-not $TargetDir -or -not (Test-Path $TargetDir)) {
    $TargetDir = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
}
$rootDir = (Resolve-Path $TargetDir).Path
$srcPoster = Join-Path $rootDir "docs\assets\original-poster.jpg"
$outDocs = Join-Path $rootDir "docs\assets\poster-frame-overlay.png"
$outPublic = Join-Path $rootDir "public\assets\poster-frame-overlay.png"

if (-not (Test-Path $srcPoster)) {
    $srcPoster = Join-Path $rootDir "public\assets\original-poster.jpg"
}

if (-not (Test-Path $srcPoster)) {
    Write-Host "Source poster not found at $srcPoster" -ForegroundColor Red
    exit 1
}

Write-Host "Creating Transparent Polaroid Frame Overlay from: $srcPoster" -ForegroundColor Cyan

$csharp = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class OverlayCreator {
    public static void CreateTransparentApertures(string inputPath, string outputPath) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int W = src.Width;
            int H = src.Height;
            Bitmap bmp = new Bitmap(W, H, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) {
                g.DrawImage(src, 0, 0, W, H);
            }

            BitmapData data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            int totalBytes = Math.Abs(stride) * H;
            byte[] bytes = new byte[totalBytes];
            Marshal.Copy(data.Scan0, bytes, 0, totalBytes);

            int[][] seeds = new int[][] {
                new int[] { (int)(W * 0.5055), (int)(H * 0.3555), (int)(W * 0.22) }, // Frame 0
                new int[] { (int)(W * 0.2450), (int)(H * 0.2520), (int)(W * 0.15) }, // Frame 1
                new int[] { (int)(W * 0.2280), (int)(H * 0.5020), (int)(W * 0.15) }, // Frame 2
                new int[] { (int)(W * 0.3720), (int)(H * 0.6520), (int)(W * 0.15) }, // Frame 3
                new int[] { (int)(W * 0.6260), (int)(H * 0.6520), (int)(W * 0.15) }, // Frame 4
                new int[] { (int)(W * 0.7280), (int)(H * 0.2600), (int)(W * 0.15) }, // Frame 5
                new int[] { (int)(W * 0.7560), (int)(H * 0.5040), (int)(W * 0.15) }  // Frame 6
            };

            bool[] visited = new bool[W * H];

            for (int f = 0; f < seeds.Length; f++) {
                int sx = seeds[f][0];
                int sy = seeds[f][1];
                int maxD = seeds[f][2];

                int sIdx = sy * stride + sx * 4;
                byte tb = bytes[sIdx];
                byte tg = bytes[sIdx + 1];
                byte tr = bytes[sIdx + 2];

                int sDiff = Math.Max(Math.Abs(tr - tg), Math.Max(Math.Abs(tr - tb), Math.Abs(tg - tb)));
                if (sDiff > 25 || tr < 130 || tr > 235) continue;

                Queue<int> q = new Queue<int>();
                int startPix = sy * W + sx;
                q.Enqueue(startPix);
                visited[startPix] = true;

                while (q.Count > 0) {
                    int curr = q.Dequeue();
                    int cy = curr / W;
                    int cx = curr % W;

                    int pIdx = cy * stride + cx * 4;
                    bytes[pIdx + 3] = 0; // Alpha = 0 (Transparent)

                    int[] dx = { 0, 0, -1, 1 };
                    int[] dy = { -1, 1, 0, 0 };

                    for (int i = 0; i < 4; i++) {
                        int nx = cx + dx[i];
                        int ny = cy + dy[i];

                        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
                        if (Math.Abs(nx - sx) > maxD || Math.Abs(ny - sy) > maxD) continue;

                        int nPix = ny * W + nx;
                        if (visited[nPix]) continue;

                        int npIdx = ny * stride + nx * 4;
                        byte b = bytes[npIdx];
                        byte g = bytes[npIdx + 1];
                        byte r = bytes[npIdx + 2];

                        int dR = r - tr;
                        int dG = g - tg;
                        int dB = b - tb;
                        int distSq = dR * dR + dG * dG + dB * dB;
                        int diff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                        if (distSq <= 2400 && diff <= 24) {
                            visited[nPix] = true;
                            q.Enqueue(nPix);
                        }
                    }
                }
            }

            Marshal.Copy(bytes, 0, data.Scan0, totalBytes);
            bmp.UnlockBits(data);
            bmp.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies "System.Drawing"

[OverlayCreator]::CreateTransparentApertures($srcPoster, $outDocs)
Copy-Item $outDocs $outPublic -Force

Write-Host "✅ Created transparent overlay:" -ForegroundColor Green
Write-Host "   - $outDocs" -ForegroundColor Green
Write-Host "   - $outPublic" -ForegroundColor Green
