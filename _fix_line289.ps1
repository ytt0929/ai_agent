$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# Fix line 289 (index 288) - replace the broken placeholder with proper text
$oldLine = $lines[288]
# The line ends with placeholder="杈撳叆闂鈥? (missing closing quote)
# Replace everything after placeholder=" with: 输入问题…"
$newLine = $oldLine -replace 'placeholder="[^"]*$', 'placeholder="输入问题…"'

Write-Output "Old: $oldLine"
Write-Output "New: $newLine"
Write-Output "Quote count old: $(($oldLine.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"
Write-Output "Quote count new: $(($newLine.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"

$lines[288] = $newLine

# Write back with UTF-8 BOM
$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)
Write-Output "File saved successfully"
