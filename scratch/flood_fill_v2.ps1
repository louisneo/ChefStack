Add-Type -AssemblyName System.Drawing

$inputPath = (Get-Item "scratch/original_logo.png").FullName
$outputPath = (Get-Item ".").FullName + "/assets/chefstack_logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
$w = $bmp.Width
$h = $bmp.Height

$visited = New-Object 'bool[,]' $w, $h
$stack = New-Object System.Collections.Generic.Stack[System.Drawing.Point]

for ($x = 0; $x -lt $w; $x++) {
    $stack.Push((New-Object System.Drawing.Point -ArgumentList $x, 0))
    $stack.Push((New-Object System.Drawing.Point -ArgumentList $x, ($h - 1)))
}
for ($y = 0; $y -lt $h; $y++) {
    $stack.Push((New-Object System.Drawing.Point -ArgumentList 0, $y))
    $stack.Push((New-Object System.Drawing.Point -ArgumentList ($w - 1), $y))
}

while ($stack.Count -gt 0) {
    $pt = $stack.Pop()
    $px = [int]$pt.X
    $py = [int]$pt.Y

    if ($px -lt 0 -or $px -ge $w -or $py -lt 0 -or $py -ge $h) { continue }
    if ($visited[$px, $py]) { continue }

    $color = $bmp.GetPixel($px, $py)
    
    # Outer background is pure white / near-white
    if ([int]$color.R -ge 210 -and [int]$color.G -ge 210 -and [int]$color.B -ge 210) {
        $visited[$px, $py] = $true
        $bmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))

        $p1 = $px + 1
        $p2 = $px - 1
        $q1 = $py + 1
        $q2 = $py - 1

        $stack.Push((New-Object System.Drawing.Point -ArgumentList $p1, $py))
        $stack.Push((New-Object System.Drawing.Point -ArgumentList $p2, $py))
        $stack.Push((New-Object System.Drawing.Point -ArgumentList $px, $q1))
        $stack.Push((New-Object System.Drawing.Point -ArgumentList $px, $q2))
    }
}

$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Outer background made transparent successfully."
