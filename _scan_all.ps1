$file = "D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue"
$bytes = [System.IO.File]::ReadAllBytes($file)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

Write-Output "Scanning for unbalanced double quotes..."
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $count = ($line.ToCharArray() | Where-Object { $_ -eq '"' }).Count
    if ($count % 2 -ne 0) {
        Write-Output "LINE $($i+1): ODD QUOTES ($count) | $($line.Trim().Substring(0, [Math]::Min(100, $line.Trim().Length)))"
    }
}

Write-Output ""
Write-Output "Scanning for ? characters (corrupted UTF)..."
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $qpos = $line.IndexOf('?')
    if ($qpos -ge 0) {
        # Check if the ? is followed by something that breaks a quote
        Write-Output "LINE $($i+1): HAS '?' | $($line.Trim().Substring(0, [Math]::Min(120, $line.Trim().Length)))"
    }
}
