$content = [System.IO.File]::ReadAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", [System.Text.Encoding]::UTF8)
$lines = $content -split "`r?`n"

# Check line 289 and 290 (0-indexed: 288, 289)
for ($idx = 287; $idx -le 291; $idx++) {
    $line = $lines[$idx]
    Write-Output "Line $($idx+1) (len=$($line.Length)):"
    Write-Output $line
    Write-Output "---"
    # Check for unbalanced quotes
    $dquote = ($line.ToCharArray() | Where-Object { $_ -eq '"' }).Count
    $squote = ($line.ToCharArray() | Where-Object { $_ -eq "'" }).Count
    Write-Output "  Double quotes: $dquote  Single quotes: $squote"
    # Show all chars
    $chars = $line.ToCharArray()
    for ($i = 0; $i -lt $chars.Length; $i++) {
        $code = [int]$chars[$i]
        if ($code -gt 127) {
            Write-Output "  [$i] '$($chars[$i])' U+$($code.ToString('X4'))"
        }
    }
    Write-Output ""
}
