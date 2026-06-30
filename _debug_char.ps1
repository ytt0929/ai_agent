$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"
$line = $lines[288]

# Show every char in line 289 with hex codes
for ($i = 0; $i -lt $line.Length; $i++) {
    $code = [int]$line[$i]
    Write-Output "  [$i] '$($line[$i])' U+$($code.ToString('X4')) dec=$code"
}
