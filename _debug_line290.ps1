$content = [System.IO.File]::ReadAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", [System.Text.Encoding]::UTF8)
$lines = $content -split "`r?`n"
$line = $lines[289]  # 0-indexed, so line 290
Write-Output "Line 290 length: $($line.Length)"
Write-Output "Line 290:"
Write-Output $line
Write-Output "---"
# Show bytes around column 54
$chars = $line.ToCharArray()
for ($i = [Math]::Max(0, 45); $i -lt [Math]::Min($chars.Length, 70); $i++) {
    $code = [int]$chars[$i]
    $hex = $code.ToString("X4")
    Write-Output "  [$i] '$($chars[$i])' U+$hex"
}
