# ==============================================================================
# 🎨 8x10 KODAK PHOTO PRINT ENGINE & ASSET GENERATOR (300 DPI)
# ==============================================================================
# Formats the Shaaaw Scrapbook Birthday Poster for exact 8" x 10" Kodak Photo Paper
# Resolution: 2400 x 3000 pixels @ 300 DPI (International Photo Lab Standard)
# Ensures safe margin zones for frame lips and lab trimming blades.
# Also extracts & processes Lord Nandhish caricature into transparent PNG.
# ==============================================================================

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Design

$rootDir = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $rootDir "public\assets"
$docsDir = Join-Path $rootDir "docs"
$docsAssetsDir = Join-Path $docsDir "assets"

if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null }
if (-not (Test-Path $docsAssetsDir)) { New-Item -ItemType Directory -Path $docsAssetsDir -Force | Out-Null }

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "📸 KODAK 8x10 PRINT ENGINE & LORD NANDHISH ASSET SETUP" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 1: Process Lord Nandhish (Supreme Celestial Preserver)
# ------------------------------------------------------------------------------
Write-Host "1. Processing Lord Nandhish Caricature..." -ForegroundColor Cyan

$userUploadedLord = "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789364766184.jpg"
$lordPngOutput = Join-Path $assetsDir "lord-nandhish.png"
$lordRawOutput = Join-Path $assetsDir "lord-nandhish-raw.jpg"
$docsLordPng = Join-Path $docsAssetsDir "lord-nandhish.png"

$lordSource = $null
if (Test-Path $userUploadedLord) {
    $lordSource = $userUploadedLord
} elseif (Test-Path $lordRawOutput) {
    $lordSource = $lordRawOutput
} elseif (Test-Path (Join-Path $assetsDir "caricature.png")) {
    $lordSource = Join-Path $assetsDir "caricature.png"
}

if ($lordSource) {
    Copy-Item $lordSource $lordRawOutput -Force
    Write-Host "   -> Loaded raw caricature from: $lordSource" -ForegroundColor Green

    try {
        $bmpRaw = [System.Drawing.Bitmap]::FromFile($lordSource)
        $w = $bmpRaw.Width
        $h = $bmpRaw.Height
        $bmpTrans = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

        # Flood fill / transparent conversion for faux checkerboard
        # Checkerboard is neutral grey (~170-218) or white (>235)
        for ($y = 0; $y -lt $h; $y++) {
            for ($x = 0; $x -lt $w; $x++) {
                $c = $bmpRaw.GetPixel($x, $y)
                $r = [int]$c.R
                $g = [int]$c.G
                $b = [int]$c.B
                $maxDiff = [Math]::Max([Math]::Abs($r - $g), [Math]::Max([Math]::Abs($r - $b), [Math]::Abs($g - $b)))

                # Check if pixel is part of checkerboard background (neutral color)
                $isGreyChecker = ($r -ge 160 -and $r -le 225 -and $g -ge 160 -and $g -le 225 -and $b -ge 160 -and $b -le 225 -and $maxDiff -le 16)
                $isWhiteChecker = ($r -ge 235 -and $g -ge 235 -and $b -ge 235)

                if ($isGreyChecker -or $isWhiteChecker) {
                    $bmpTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } else {
                    $bmpTrans.SetPixel($x, $y, $c)
                }
            }
        }

        $bmpTrans.Save($lordPngOutput, [System.Drawing.Imaging.ImageFormat]::Png)
        Copy-Item $lordPngOutput $docsLordPng -Force
        $bmpRaw.Dispose()
        $bmpTrans.Dispose()
        Write-Host "   ✅ Saved transparent Lord Nandhish to: $lordPngOutput" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Trans-processing fallback, copied source: $($_.Exception.Message)" -ForegroundColor Yellow
        Copy-Item $lordSource $lordPngOutput -Force
        Copy-Item $lordSource $docsLordPng -Force
    }
} else {
    Write-Host "   ⚠️ Could not locate Lord Nandhish source image." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# STEP 2: Format Collage for 8x10 Inch Kodak Photo Paper (2400 x 3000 @ 300 DPI)
# ------------------------------------------------------------------------------
Write-Host "`n2. Formatting Scrapbook Poster for 8x10 Inch Kodak Photo Paper..." -ForegroundColor Cyan

$userUploadedPoster = "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789368265793.jpg"
$localPoster = Join-Path $assetsDir "original-poster.jpg"

$posterSource = $null
if (Test-Path $userUploadedPoster) {
    $posterSource = $userUploadedPoster
    Copy-Item $userUploadedPoster $localPoster -Force
    Write-Host "   -> Updated original-poster.jpg with latest uploaded collage." -ForegroundColor Green
} elseif (Test-Path $localPoster) {
    $posterSource = $localPoster
}

if ($posterSource) {
    try {
        $origBmp = [System.Drawing.Bitmap]::FromFile($posterSource)
        $origW = $origBmp.Width
        $origH = $origBmp.Height
        Write-Host "   -> Original Collage Dimensions: ${origW} x ${origH} (Ratio: $([Math]::Round($origW / $origH, 4)))" -ForegroundColor Green

        # Target 8x10 inch @ 300 DPI = 2400 x 3000
        $targetW = 2400
        $targetH = 3000

        # Safe margins:
        # Kodak Print Bleed = 38px (1/8" trim zone)
        # Frame Rebate Margin = 75px (1/4" frame lip safe area)
        $safeMargin = 85 # 85px safe margin ensures all 8 QR codes are 100% inside safe zone
        $availW = $targetW - ($safeMargin * 2)
        $availH = $targetH - ($safeMargin * 2)

        # Scale collage to fit cleanly within available height & width
        $scale = [Math]::Min($availW / $origW, $availH / $origH)
        $drawW = [int]($origW * $scale)
        $drawH = [int]($origH * $scale)
        $drawX = [int](($targetW - $drawW) / 2)
        $drawY = [int](($targetH - $drawH) / 2)

        # ----------------------------------------------------------------------
        # Style A: Archival Kodak Photo Mat (Vintage Warm Cream & Rose Gold Frame)
        # ----------------------------------------------------------------------
        $bmpMat = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $bmpMat.SetResolution(300.0, 300.0) # Embed 300 DPI metadata
        $gMat = [System.Drawing.Graphics]::FromImage($bmpMat)
        $gMat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gMat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $gMat.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        # Fill with vintage archival warm cream parchment (#fbf6ee)
        $parchmentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(251, 246, 238))
        $gMat.FillRectangle($parchmentBrush, 0, 0, $targetW, $targetH)

        # Draw subtle vintage double frame border
        $roseGoldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(218, 140, 160), 4.0)
        $innerGoldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(235, 190, 200), 2.0)
        $gMat.DrawRectangle($roseGoldPen, 50, 50, $targetW - 100, $targetH - 100)
        $gMat.DrawRectangle($innerGoldPen, 65, 65, $targetW - 130, $targetH - 130)

        # Draw soft shadow behind collage
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
        $gMat.FillRectangle($shadowBrush, $drawX + 8, $drawY + 8, $drawW, $drawH)

        # Draw the main collage
        $gMat.DrawImage($origBmp, $drawX, $drawY, $drawW, $drawH)

        # Clean border around collage edge
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 230, 220), 3.0)
        $gMat.DrawRectangle($borderPen, $drawX, $drawY, $drawW, $drawH)

        # Output paths
        $outJpg = Join-Path $rootDir "Shaaaw-Scrapbook-Poster-8x10-Kodak-300DPI.jpg"
        $outPng = Join-Path $rootDir "Shaaaw-Scrapbook-Poster-8x10-Kodak-300DPI.png"
        $assetJpg = Join-Path $assetsDir "Shaaaw-8x10-Kodak-Print.jpg"
        $docsJpg = Join-Path $docsAssetsDir "Shaaaw-8x10-Kodak-Print.jpg"

        # Save JPEG with 98% quality for photo lab
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 98L)
        $jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

        $bmpMat.Save($outJpg, $jpgCodec, $encoderParams)
        $bmpMat.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)
        Copy-Item $outJpg $assetJpg -Force
        Copy-Item $outJpg $docsJpg -Force

        $gMat.Dispose()
        $bmpMat.Dispose()
        $origBmp.Dispose()

        Write-Host "   ✅ MASTER KODAK 8x10 PRINT CREATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "      📁 JPEG: $outJpg (2400x3000 @ 300 DPI)" -ForegroundColor Green
        Write-Host "      📁 PNG:  $outPng (2400x3000 @ 300 DPI)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Error creating Kodak print: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ Poster source image not found." -ForegroundColor Yellow
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "🎉 COMPLETE! Your 8x10 Kodak photo print is ready to print!" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
