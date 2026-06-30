$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

$oldLine = $lines[288]
Write-Output "Old line length: $($oldLine.Length)"
Write-Output "Last 5 chars:"
for ($i = [Math]::Max(0, $oldLine.Length - 10); $i -lt $oldLine.Length; $i++) {
    $c = $oldLine[$i]
    $code = [int]$c
    Write-Output "  [$i] '$c' U+$($code.ToString('X4'))"
}

# Replace from index 90 (the opening " of placeholder) to end
$newLine = $oldLine.Substring(0, 90) + '"输入问题…"'
$lines[288] = $newLine

Write-Output "New line:"
Write-Output $newLine
Write-Output "New length: $($newLine.Length)"
Write-Output "Quote count: $(($newLine.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"

$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)
Write-Output "Saved!"
