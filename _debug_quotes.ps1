$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# Show lines 287-293 with char-level detail around problematic area
for ($idx = 286; $idx -le 292; $idx++) {
    $line = $lines[$idx]
    Write-Output "=== Line $($idx+1) ==="
    Write-Output $line
    
    # Check for unbalanced double quotes
    $positions = @()
    for ($i = 0; $i -lt $line.Length; $i++) {
        if ($line[$i] -eq '"') {
            $positions += $i
        }
    }
    if ($positions.Count % 2 -ne 0) {
        Write-Output "  ** ODD NUMBER OF DOUBLE QUOTES ($($positions.Count)) at positions: $($positions -join ',')"
        foreach ($p in $positions) {
            $context = $line.Substring([Math]::Max(0,$p-10), [Math]::Min(20, $line.Length - [Math]::Max(0,$p-10)))
            Write-Output "    pos $p : ...$context..."
        }
    }
    Write-Output ""
}
