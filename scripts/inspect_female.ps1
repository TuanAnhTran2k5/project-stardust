Add-Type -AssemblyName System.Drawing

$filePath = "C:\Users\PC\.gemini\antigravity-ide\brain\4233b952-4ec7-4981-99a4-4e7323a42a3b\female_sniper_anime_1793023427114.jpg"
if (Test-Path $filePath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $topLeft = $bmp.GetPixel(0, 0)
    $topRight = $bmp.GetPixel($bmp.Width - 1, 0)
    $bottomLeft = $bmp.GetPixel(0, $bmp.Height - 1)
    Write-Host "Female Sniper: Width: $($bmp.Width), Height: $($bmp.Height)"
    Write-Host "TopLeft: R=$($topLeft.R), G=$($topLeft.G), B=$($topLeft.B)"
    Write-Host "TopRight: R=$($topRight.R), G=$($topRight.G), B=$($topRight.B)"
    Write-Host "BottomLeft: R=$($bottomLeft.R), G=$($bottomLeft.G), B=$($bottomLeft.B)"
    $bmp.Dispose()
}
