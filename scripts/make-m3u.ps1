Param(
  # Use your live domain for Alexa/remote playback, e.g. https://smartdocspack.netlify.app
  [string]$Domain    = "",
  # Where your audio files live (relative to this script)
  [string]$AudioFolder = "..\audio",
  # Output playlist file (relative to this script)
  [string]$OutFile     = "..\SmartDocsRadio.m3u",
  # Include subfolders under /audio
  [switch]$Recurse
)

# --- Resolve paths
$audioPath  = Resolve-Path (Join-Path $PSScriptRoot $AudioFolder)
$outPath    = Join-Path $PSScriptRoot $OutFile

# --- Header
"#EXTM3U" | Set-Content $outPath -Encoding UTF8

# --- Collect audio files
$files = Get-ChildItem -Path $audioPath -File -Recurse:([bool]$Recurse) |
  Where-Object { $_.Extension -in ".mp3", ".aac" } |
  Sort-Object Name

$added = 0

foreach ($f in $files) {
  # Pretty display title: strip extension + brackets/parentheses
  $title = $f.BaseName -replace '\s*\[[^\]]*\]', '' -replace '\s*\([^)]*\)', ''

  # URL-encode filename for maximum compatibility
  $encodedName = [System.Uri]::EscapeDataString($f.Name)

  if ($Domain) {
    $url = "$Domain/audio/$encodedName"
  } else {
    # site-only relative path (OK in browser, not for Alexa)
    $url = "audio/$encodedName"
  }

  "#EXTINF:-1,$title" | Add-Content $outPath -Encoding UTF8
  Add-Content $outPath $url
  $added++
}

Write-Host "Wrote $outPath ($added tracks) from $audioPath"
