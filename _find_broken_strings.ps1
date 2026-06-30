$file = "D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue"
$bytes = [System.IO.File]::ReadAllBytes($file)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# Find all lines where ? appears inside a single-quoted string (corrupted mojibake)
# Pattern: '...'?'  or '...? with no closing '
$problemLines = @()
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    # Look for single-quoted strings with ? at the end (corrupted)
    # Pattern: 'text?' or 'text?' followed by comma/close
    if ($line -match "'[^']*?\?'[^']*'") {
        $problemLines += @{Line=$i+1; Content=$line.Trim()}
    }
    # Pattern: 'text?' without closing quote on this line
    if ($line -match "'[^']*?$" -and $line -match "''[^']*?$") {
        $problemLines += @{Line=$i+1; Content=$line.Trim(); Note="unclosed"}
    }
}

Write-Output "=== Problematic lines ==="
foreach ($p in $problemLines) {
    Write-Output "LINE $($p.Line): $($p.Content)"
    if ($p.Note) { Write-Output "  NOTE: $($p.Note)" }
}
