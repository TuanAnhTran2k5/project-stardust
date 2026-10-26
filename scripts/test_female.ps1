Add-Type -AssemblyName System.Drawing

$filePath = "d:\ProjectFE3D\project-3d-fe\public\images\characters\female_sniper.jpg"
if (Test-Path $filePath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $topLeft = $bmp.GetPixel(0, 0)
    Write-Host "Female Sniper: Width: $($bmp.Width), Height: $($bmp.Height), TopLeft: R=$($topLeft.R), G=$($topLeft.G), B=$($topLeft.B)"
    $bmp.Dispose()
}
