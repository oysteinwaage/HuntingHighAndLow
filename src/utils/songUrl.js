// Suno tillater ikke lenger direkte avspilling/hotlinking av mp3-filer, så
// lenker må åpnes på suno.com/song/<id> i en egen fane i stedet for å spilles
// av i appen. Matcher både suno.com/song/<id>-lenker og gamle
// cdn1.suno.ai/<id>.mp3-lenker.
const SUNO_ID_PATTERN =
  /(?:suno\.com\/song\/|cdn\d*\.suno\.ai\/)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i

export function getSunoSongPageUrl(url) {
  const match = url.match(SUNO_ID_PATTERN)
  return match ? `https://suno.com/song/${match[1]}` : url
}
