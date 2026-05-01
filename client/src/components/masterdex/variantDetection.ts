export function isVariantCardName(name: string): boolean {
  if (/^Mega\s/i.test(name)) return true;
  if (/^M\s/i.test(name)) return true;
  if (/\sVMAX$/i.test(name)) return true;
  if (/\sVSTAR$/i.test(name)) return true;
  if (/^Radiant\s/i.test(name)) return true;
  if (/^(Hisuian|Galarian|Alolan|Paldean)\s/i.test(name)) return true;
  if (/\s&\s/.test(name)) return true;
  return false;
}
