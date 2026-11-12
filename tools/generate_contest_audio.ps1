# Run with Windows PowerShell to generate the included offline English clips.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectRoot = Split-Path -Parent $PSScriptRoot
$content = Get-Content -LiteralPath (Join-Path $projectRoot 'data/contest-2026.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $voices = @($speaker.GetInstalledVoices() | Where-Object {
        $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'en-US'
    })
    $voice = $voices | Where-Object { $_.VoiceInfo.Name -like '*Zira*' } | Select-Object -First 1
    if (-not $voice) { $voice = $voices | Select-Object -First 1 }
    if (-not $voice) { throw 'An installed en-US voice is required.' }
    $speaker.SelectVoice($voice.VoiceInfo.Name)
    $speaker.Rate = -1
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
        22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
        [System.Speech.AudioFormat.AudioChannel]::Mono
    )
    foreach ($entry in $content.words) {
        foreach ($kind in @('words', 'sentences')) {
            $outputPath = Join-Path $projectRoot ('assets/audio/' + $kind + '/' + $entry.word + '.wav')
            # Existing weekly clips remain unchanged (desk is shared).
            if (Test-Path -LiteralPath $outputPath) { continue }
            $text = if ($kind -eq 'words' -and $entry.display) {
                $entry.display
            } elseif ($kind -eq 'words') {
                $entry.word
            } else {
                $entry.sentence
            }
            $speaker.SetOutputToWaveFile($outputPath, $format)
            $speaker.Speak($text)
            $speaker.SetOutputToNull()
        }
    }
    Write-Output ('OK: contest audio generated with ' + $voice.VoiceInfo.Name)
} finally {
    $speaker.Dispose()
}
