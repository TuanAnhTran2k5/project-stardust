Add-Type -AssemblyName System.Drawing

function Remove-BlackBackground {
    param (
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Threshold = 18
    )

    Write-Host "Processing: $InputPath"
    $src = [System.Drawing.Bitmap]::FromFile($InputPath)
    $width = $src.Width
    $height = $src.Height

    # Create 32-bit ARGB bitmap
    $dst = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # 2D array to track visited background pixels
    $isBg = New-Object 'bool[,]' $width, $height
    $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

    # Helper function to check if pixel is near-black background
    function Is-DarkPixel([System.Drawing.Color]$c) {
        return ($c.R -le $Threshold -and $c.G -le $Threshold -and $c.B -le $Threshold)
    }

    # Seed from all 4 borders
    for ($x = 0; $x -lt $width; $x++) {
        if (-not $isBg[$x, 0] -and (Is-DarkPixel ($src.GetPixel($x, 0)))) {
            $isBg[$x, 0] = $true
            $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
        }
        $bY = $height - 1
        if (-not $isBg[$x, $bY] -and (Is-DarkPixel ($src.GetPixel($x, $bY)))) {
            $isBg[$x, $bY] = $true
            $queue.Enqueue((New-Object System.Drawing.Point($x, $bY)))
        }
    }
    for ($y = 0; $y -lt $height; $y++) {
        if (-not $isBg[0, $y] -and (Is-DarkPixel ($src.GetPixel(0, $y)))) {
            $isBg[0, $y] = $true
            $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
        }
        $rX = $width - 1
        if (-not $isBg[$rX, $y] -and (Is-DarkPixel ($src.GetPixel($rX, $y)))) {
            $isBg[$rX, $y] = $true
            $queue.Enqueue((New-Object System.Drawing.Point($rX, $y)))
        }
    }

    # BFS Flood fill outer background only
    $dx = @(0, 0, 1, -1)
    $dy = @(1, -1, 0, 0)
    while ($queue.Count -gt 0) {
        $pt = $queue.Dequeue()
        for ($i = 0; $i -lt 4; $i++) {
            $nx = $pt.X + $dx[$i]
            $ny = $pt.Y + $dy[$i]
            if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
                if (-not $isBg[$nx, $ny]) {
                    $c = $src.GetPixel($nx, $ny)
                    if (Is-DarkPixel $c) {
                        $isBg[$nx, $ny] = $true
                        $queue.Enqueue((New-Object System.Drawing.Point($nx, $ny)))
                    }
                }
            }
        }
    }

    # Now copy pixels to dst with alpha
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            if ($isBg[$x, $y]) {
                # Transparent background
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $c = $src.GetPixel($x, $y)
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }

    $dst.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dst.Dispose()
    Write-Host "Saved transparent PNG to $OutputPath"
}

Remove-BlackBackground `
    -InputPath "C:\Users\PC\.gemini\antigravity-ide\brain\4233b952-4ec7-4981-99a4-4e7323a42a3b\male_receiver_fixed_1793023935757.jpg" `
    -OutputPath "d:\ProjectFE3D\project-3d-fe\public\images\characters\male_receiver.png" `
    -Threshold 22

Remove-BlackBackground `
    -InputPath "C:\Users\PC\.gemini\antigravity-ide\brain\4233b952-4ec7-4981-99a4-4e7323a42a3b\female_sniper_anime_1793023427114.jpg" `
    -OutputPath "d:\ProjectFE3D\project-3d-fe\public\images\characters\female_sniper.png" `
    -Threshold 18
