$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

$old = $lines[288]
Write-Output "Current line 289:"
Write-Output $old
Write-Output ""

# Find position of 'placeholder='
$pos = $old.IndexOf('placeholder=')
Write-Output "placeholder= starts at index $pos"

# Rebuild: everything before placeholder=, then proper attribute
$before = $old.Substring(0, $pos)
$newLine = $before + 'placeholder="输入问题…"'
$lines[288] = $newLine

Write-Output "New line 289:"
Write-Output $newLine
Write-Output "Quote count: $(($newLine.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"

$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)
Write-Output "File saved successfully!"
