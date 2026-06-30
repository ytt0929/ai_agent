$file = "D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue"
$bytes = [System.IO.File]::ReadAllBytes($file)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# Show line 473 char by char for non-ASCII
$line = $lines[472]
Write-Output "Line 473 length: $($line.Length)"
Write-Output "Raw: $line"
for ($i = 0; $i -lt $line.Length; $i++) {
    $c = [int]$line[$i]
    if ($c -gt 127) {
        Write-Output "  [$i] '$($line[$i])' U+$($c.ToString('X4'))"
    }
}
