$file = "D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue"
$bytes = [System.IO.File]::ReadAllBytes($file)
Write-Output "File size: $($bytes.Length) bytes"

$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# Show line 289 raw
$l = $lines[288]
Write-Output "Line 289 raw bytes:"
$lBytes = [System.Text.Encoding]::UTF8.GetBytes($l)
Write-Output ($lBytes | ForEach-Object { $_.ToString("X2") }) -join " "

# Find placeholder= position
$idx = $l.IndexOf('placeholder=')
Write-Output "placeholder= at index: $idx"
Write-Output "Before placeholder=: '$($l.Substring(0, $idx))'"
Write-Output "From placeholder=: '$($l.Substring($idx))'"
