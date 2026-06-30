$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

$old = $lines[288]
Write-Output "Current line 289:"
Write-Output $old

# Rebuild line properly
$idx = $old.IndexOf('placeholder=')
$before = $old.Substring(0, $idx)
$replacement = $before + 'placeholder="输入问题…"'

Write-Output "Replacement:"
Write-Output $replacement

$lines[288] = $replacement

$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)

# Verify
$bytes2 = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text2 = [System.Text.Encoding]::UTF8.GetString($bytes2)
$lines2 = $text2 -split "`r?`n"
Write-Output "After save - line 289:"
Write-Output $lines2[288]
