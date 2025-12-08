# Update ports to avoid conflicts with TSEA-X
$cendikiaPath = '..\CENDIKIA'

# Update package.json (frontend) - change port from 3000 to 3001
$packageJson = Get-Content "$cendikiaPath\frontend\package.json" -Raw
$packageJson = $packageJson -replace '\"dev\": \"next dev\"', '\"dev\": \"next dev -p 3001\"'
Set-Content -Path "$cendikiaPath\frontend\package.json" -Value $packageJson -NoNewline

# Update backend main.py - change port from 8000 to 8001
$mainPy = Get-Content "$cendikiaPath\backend\main.py" -Raw
$mainPy = $mainPy -replace 'http://localhost:3000', 'http://localhost:3001'
$mainPy = $mainPy -replace 'http://localhost:8000', 'http://localhost:8001'
Set-Content -Path "$cendikiaPath\backend\main.py" -Value $mainPy -NoNewline

# Update frontend API calls
$files = Get-ChildItem -Path "$cendikiaPath\frontend\src" -Recurse -Include *.tsx,*.ts -File
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'http://localhost:8000') {
        $content = $content -replace 'http://localhost:8000', 'http://localhost:8001'
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host 'Port configuration updated:'
Write-Host '  Frontend: 3000 -> 3001'
Write-Host '  Backend: 8000 -> 8001'
