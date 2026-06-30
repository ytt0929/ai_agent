Get-ChildItem -Path src -Recurse -Filter "*.vue" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $lines = $content -split "`n"
    $i = 0
    foreach ($line in $lines) {
        $i++
        # Look for bare " or ' inside attribute names (not inside quotes)
        # Check for < followed by something that looks like malformed tag
        if ($line -match '<\s+/?[a-zA-Z][^>]*["<''>][^>]*>') {
            Write-Output "$($_.FullName):$i`: $line"
        }
        # Also check for literal " or ' in attribute names (between spaces, before =)
        if ($line -match '[a-zA-Z-]+["''][a-zA-Z-]+\s*=') {
            Write-Output "ATTR-QUOTES $_.FullName:$i`: $line"
        }
    }
}
