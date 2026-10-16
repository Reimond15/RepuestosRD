<#
  ============================================================================
   Genera los íconos de la app a partir de assets/images/logo.png
  ============================================================================

   Uso (desde la raíz del proyecto):
     powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generar-iconos.ps1

   Requiere el logo en  assets/images/logo.png  (cuadrado, con transparencia).

   Qué produce (todo en assets/images/):
     icon.png                    1024  ícono principal (sin transparencia)
     android-icon-foreground.png 1024  capa frontal adaptativa (transparente)
     android-icon-background.png 1024  fondo liso del ícono adaptativo
     android-icon-monochrome.png 1024  silueta para el tema monocromo
     splash-icon.png              512  pantalla de inicio (transparente)
     favicon.png                   64  ícono del navegador

   Android recorta el ícono adaptativo: por eso el logo va al 62% y queda
   dentro de la "zona segura". iOS no acepta transparencia: el icono va
   aplanado sobre el fondo.
  ============================================================================
#>

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$Raiz    = Split-Path -Parent $PSScriptRoot
$Carpeta = Join-Path $Raiz 'assets\images'
$Fuente  = Join-Path $Carpeta 'logo.png'
$Fondo   = '#0D0D0D'

if (-not (Test-Path $Fuente)) {
  throw "No encuentro el logo en $Fuente"
}

$Logo = [System.Drawing.Image]::FromFile($Fuente)

function Guardar-Derivado {
  param(
    [string] $Nombre,
    [int]    $Lado,
    [double] $Escala,
    [switch] $Transparente,
    [switch] $Blanco
  )

  $formato = if ($Transparente) {
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  } else {
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  }

  $bmp = New-Object System.Drawing.Bitmap($Lado, $Lado, $formato)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  if ($Transparente) {
    $g.Clear([System.Drawing.Color]::Transparent)
  } else {
    $g.Clear([System.Drawing.Color]::FromArgb(255, 13, 13, 13))
  }

  $ancho  = [int][Math]::Round($Lado * $Escala)
  $margen = [int][Math]::Round(($Lado - $ancho) / 2)
  $rect   = New-Object System.Drawing.Rectangle($margen, $margen, $ancho, $ancho)

  if ($Blanco) {
    # Convierte el logo en una silueta blanca conservando su transparencia.
    $cm = New-Object System.Drawing.Imaging.ColorMatrix
    $cm.Matrix00 = 0; $cm.Matrix11 = 0; $cm.Matrix22 = 0
    $cm.Matrix33 = 1
    $cm.Matrix40 = 1; $cm.Matrix41 = 1; $cm.Matrix42 = 1

    $ia = New-Object System.Drawing.Imaging.ImageAttributes
    $ia.SetColorMatrix($cm)
    $g.DrawImage($Logo, $rect, 0, 0, $Logo.Width, $Logo.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)
    $ia.Dispose()
  } else {
    $g.DrawImage($Logo, $rect, 0, 0, $Logo.Width, $Logo.Height, [System.Drawing.GraphicsUnit]::Pixel)
  }

  $g.Dispose()

  $salida = Join-Path $Carpeta $Nombre
  $bmp.Save($salida, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()

  Write-Host ("OK  {0,-28} {1}x{1}" -f $Nombre, $Lado)
}

# ---- íconos con el logo ----
Guardar-Derivado -Nombre 'icon.png'                    -Lado 1024 -Escala 0.84
Guardar-Derivado -Nombre 'android-icon-foreground.png' -Lado 1024 -Escala 0.62 -Transparente
Guardar-Derivado -Nombre 'android-icon-monochrome.png' -Lado 1024 -Escala 0.62 -Transparente -Blanco
Guardar-Derivado -Nombre 'splash-icon.png'             -Lado 512  -Escala 0.92 -Transparente
Guardar-Derivado -Nombre 'favicon.png'                 -Lado 64   -Escala 1.00

# ---- fondo liso del ícono adaptativo (sin logo) ----
$fondo = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gf    = [System.Drawing.Graphics]::FromImage($fondo)
$gf.Clear([System.Drawing.Color]::FromArgb(255, 13, 13, 13))
$gf.Dispose()
$salidaFondo = Join-Path $Carpeta 'android-icon-background.png'
$fondo.Save($salidaFondo, [System.Drawing.Imaging.ImageFormat]::Png)
$fondo.Dispose()
Write-Host ("OK  {0,-28} {1}x{1}" -f 'android-icon-background.png', 1024)

$Logo.Dispose()
Write-Host ''
Write-Host 'Listo. Íconos generados.'
