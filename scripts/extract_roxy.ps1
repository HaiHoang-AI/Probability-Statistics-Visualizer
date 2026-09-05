Add-Type -AssemblyName System.Drawing
$helperPath = Join-Path $PSScriptRoot "CropHelper.cs"
Add-Type -Path $helperPath -ReferencedAssemblies "System.Drawing"

$srcPath = Join-Path $PSScriptRoot "..\roxy.png"
$fullSrcPath = (Resolve-Path $srcPath).Path
$outDir = Join-Path $PSScriptRoot "..\public\roxy"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$sprites = @(
    # 1. Main Hero Mascot: Roxy on water wave with staff, dice & normal curve
    @{ name = "roxy_hero"; x = 10; y = 5; w = 580; h = 505 },
    # 2. Teacher Roxy with normal curve on chart
    @{ name = "roxy_teacher"; x = 585; y = 10; w = 490; h = 485 },
    # 3. Student / Thinking Roxy leaning with books & black cat
    @{ name = "roxy_thinking"; x = 1085; y = 15; w = 445; h = 450 },
    # 4. Chibi Reading Grimoire
    @{ name = "roxy_chibi_reading"; x = 15; y = 505; w = 230; h = 215 },
    # 5. Chibi Teaching at Whiteboard
    @{ name = "roxy_chibi_teaching"; x = 245; y = 510; w = 255; h = 215 },
    # 6. Chibi Rolling Dice
    @{ name = "roxy_chibi_dice"; x = 535; y = 505; w = 230; h = 225 },
    # 7. Chibi Winking with single Dice
    @{ name = "roxy_chibi_wink"; x = 775; y = 515; w = 200; h = 205 },
    # 8. Chibi Water Magic Leaping
    @{ name = "roxy_chibi_magic"; x = 995; y = 505; w = 270; h = 225 },
    # 9. Chibi Sleeping with Cat
    @{ name = "roxy_chibi_sleep"; x = 1270; y = 535; w = 250; h = 185 },
    # 10. Avatar Icons (Circular)
    @{ name = "roxy_avatar_smile"; x = 15; y = 735; w = 160; h = 155 },
    @{ name = "roxy_avatar_wink"; x = 180; y = 740; w = 155; h = 150 },
    @{ name = "roxy_avatar_profile"; x = 338; y = 740; w = 155; h = 150 },
    # 11. Empty state: "No data yet..." with cat
    @{ name = "roxy_no_data"; x = 1350; y = 750; w = 175; h = 225 },
    # 12. "Loading magic..." progress bar
    @{ name = "roxy_loading"; x = 1120; y = 780; w = 220; h = 150 },
    # 13. Magic accessories
    @{ name = "roxy_grimoire"; x = 835; y = 865; w = 115; h = 120 },
    @{ name = "roxy_potion"; x = 965; y = 875; w = 85; h = 105 }
)

foreach ($s in $sprites) {
    $targetFile = Join-Path $outDir "$($s.name).png"
    [CropHelper]::CropAndMakeTransparent($fullSrcPath, $targetFile, $s.x, $s.y, $s.w, $s.h, $true)
    Write-Output "Extracted: $($s.name).png ($($s.w)x$($s.h))"
}

Write-Output "SUCCESS: All sprites extracted with clean transparent backgrounds!"
