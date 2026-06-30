$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

$old = $lines[288]
Write-Output "OLD line 289:"
Write-Output $old

# Position 90 is the opening " of placeholder value
# Take chars 0-89 (includes placeholder=), then append proper quoted value
$prefix = $old.Substring(0, 90)  # includes the = and opening "
$replacement = $prefix + '输入问题…"'
$lines[288] = $replacement

Write-Output "NEW line 289:"
Write-Output $replacement
Write-Output "Quote count in new: $(($replacement.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"

$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)
Write-Output "Saved!"
