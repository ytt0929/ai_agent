$bytes = [System.IO.File]::ReadAllBytes("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`r?`n"

# The broken line 289 (index 288) needs to be replaced entirely
# It should be: <input v-model="store.chatInput" class="ed-chat-input__field" placeholder="输入问题…" />
$newLine = '                <input v-model="store.chatInput" class="ed-chat-input__field" placeholder="输入问题…"'
$lines[288] = $newLine

Write-Output "New line:"
Write-Output $newLine
Write-Output "Quote count: $(($newLine.ToCharArray() | Where-Object { $_ -eq '"' }).Count)"

$output = $lines -join "`r`n"
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("D:\demo\ai-copilot\src\pages\EnterpriseDiagnosisPage.vue", $output, $utf8BOM)
Write-Output "Saved!"
