Add-Type -AssemblyName System.Drawing

$inputPath = "scratch/original_logo.png"
$outputPath = "assets/chefstack_logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile((Get-Item $inputPath).FullName)
$w = $bmp.Width
$h = $bmp.Height

$visited = New-Object "bool[,]" $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

for ($x = 0; $x -lt $w; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, $h - 1)))
}
for ($y = 0; $y -lt $h; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point($w - 1, $y)))
}

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $px = $pt.X
    $py = $pt.Y

    if ($px -lt 0 -or $px -ge $w -or $py -lt 0 -or $py -ge $h) { continue }
    if ($visited[$px, $py]) { continue }

    $color = $bmp.GetPixel($px, $py)
    
    if ($color.R -ge 200 -and $color.G -ge 200 -and $color.B -ge 200) {
        $visited[$px, $py] = $true
        $bmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))

        $queue.Enqueue((New-Object System.Drawing.Point($px + 1, $py)))
        $queue.Enqueue((New-Object System.Drawing.Point($px - 1, $py)))
        $queue.Enqueue((New-Object System.Drawing.Point($px, $py + 1)))
        $queue.Enqueue((New-Object System.Drawing.Point($px, $py - 1)))
    }
}

$bmp.Save((Get-Item .).FullName + "/" + $outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Flood-fill transparency process completed successfully."
