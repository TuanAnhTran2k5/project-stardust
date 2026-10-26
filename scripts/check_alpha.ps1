Add-Type -AssemblyName System.Drawing

function Check-Alpha([string]$path, [string]$name) {
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    $corner = $bmp.GetPixel(0, 0)
    $center = $bmp.GetPixel([int]($bmp.Width / 2), [int]($bmp.Height / 2))
    Write-Host "$name - Corner Alpha: $($corner.A), Center Alpha: $($center.A)"
    $bmp.Dispose()
}

Check-Alpha "d:\ProjectFE3D\project-3d-fe\public\images\characters\male_receiver.png" "Male Receiver PNG"
Check-Alpha "d:\ProjectFE3D\project-3d-fe\public\images\characters\female_sniper.png" "Female Sniper PNG"
