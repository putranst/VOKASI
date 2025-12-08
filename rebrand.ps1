# CENDIKIA Rebranding Script
$ErrorActionPreference = 'Continue'
$cendikiaPath = '..\CENDIKIA'

# Files to update (excluding node_modules, .venv, .next, etc.)
$files = Get-ChildItem -Path $cendikiaPath -Recurse -Include *.tsx,*.ts,*.py,*.md,*.json,*.html -File | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.venv|\.next|package-lock\.json' }

Write-Host "Found $($files.Count) files to process"

$count = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        if ($content -match 'TSEA-X') {
            $newContent = $content -replace 'TSEA-X', 'CENDIKIA'
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            $count++
            Write-Host "Updated: $($file.Name)"
        }
    } catch {
        Write-Host "Skipped: $($file.Name) - $_"
    }
}

Write-Host "
Rebranding complete! Updated $count files."
