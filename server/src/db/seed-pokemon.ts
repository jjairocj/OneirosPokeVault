/**
 * Seed script: populate pokemon_dex with Pokédex #1–1025 display names.
 * Run: npx ts-node --esm src/db/seed-pokemon.ts  (or via tsx)
 *
 * Names sourced from PokeAPI (https://pokeapi.co/api/v2/pokemon?limit=1025)
 * with display-name overrides for special characters and formatting.
 */
import { db } from './index.js';
import { pokemonDex } from './schema.js';

// Manual overrides for names that need special characters or casing
const OVERRIDES: Record<number, string> = {
  29: 'Nidoran♀',
  32: 'Nidoran♂',
  83: "Farfetch'd",
  122: 'Mr. Mime',
  175: 'Togepi', // sometimes listed as togepi-base
  250: 'Ho-Oh',
  474: 'Porygon-Z',
  562: 'Yamask', // galarian form issue
  618: 'Stunfisk', // galarian form issue
  785: 'Tapu Koko',
  786: 'Tapu Lele',
  787: 'Tapu Bulu',
  788: 'Tapu Fini',
  808: 'Meltan',
  809: 'Melmetal',
  854: 'Sinistea',
  855: 'Polteageist',
  863: 'Perrserker',
  865: "Sirfetch'd",
  891: 'Kubfu',
  892: 'Urshifu',
  893: 'Zarude',
  894: 'Regieleki',
  895: 'Regidrago',
  896: 'Glastrier',
  897: 'Spectrier',
  898: 'Calyrex',
  899: 'Wyrdeer',
  900: 'Kleavor',
  901: 'Ursaluna',
  902: 'Basculegion',
  903: 'Sneasler',
  904: 'Overqwil',
  905: 'Enamorus',
  906: 'Sprigatito',
  907: 'Floragato',
  908: 'Meowscarada',
  909: 'Fuecoco',
  910: 'Crocalor',
  911: 'Skeledirge',
  912: 'Quaxly',
  913: 'Quaxwell',
  914: 'Quaquaval',
  915: 'Lechonk',
  916: 'Oinkologne',
  917: 'Tarountula',
  918: 'Spidops',
  919: 'Nymble',
  920: 'Lokix',
  921: 'Pawmi',
  922: 'Pawmo',
  923: 'Pawmot',
  924: 'Tandemaus',
  925: 'Maushold',
  926: 'Fidough',
  927: 'Dachsbun',
  928: 'Smoliv',
  929: 'Dolliv',
  930: 'Arboliva',
  931: 'Squawkabilly',
  932: 'Nacli',
  933: 'Naclstack',
  934: 'Garganacl',
  935: 'Charcadet',
  936: 'Armarouge',
  937: 'Ceruledge',
  938: 'Tadbulb',
  939: 'Bellibolt',
  940: 'Wattrel',
  941: 'Kilowattrel',
  942: 'Maschiff',
  943: 'Maboss',
  944: 'Shroodle',
  945: 'Grafaiai',
  946: 'Bramblin',
  947: 'Brambleghast',
  948: 'Toedscool',
  949: 'Toedscruel',
  950: 'Klawf',
  951: 'Capsakid',
  952: 'Scovillain',
  953: 'Rellor',
  954: 'Rabsca',
  955: 'Flittle',
  956: 'Espathra',
  957: 'Tinkatink',
  958: 'Tinkatuff',
  959: 'Tinkaton',
  960: 'Wiglett',
  961: 'Wugtrio',
  962: 'Bombirdier',
  963: 'Finizen',
  964: 'Palafin',
  965: 'Varoom',
  966: 'Revavroom',
  967: 'Cyclizar',
  968: 'Orthworm',
  969: 'Glimmet',
  970: 'Glimmora',
  971: 'Greavard',
  972: 'Houndstone',
  973: 'Flamigo',
  974: 'Cetoddle',
  975: 'Cetitan',
  976: 'Veluza',
  977: 'Dondozo',
  978: 'Tatsugiri',
  979: 'Annihilape',
  980: 'Clodsire',
  981: 'Farigiraf',
  982: 'Dudunsparce',
  983: 'Kingambit',
  984: 'Great Tusk',
  985: 'Scream Tail',
  986: 'Brute Bonnet',
  987: 'Flutter Mane',
  988: 'Slither Wing',
  989: 'Sandy Shocks',
  990: 'Iron Treads',
  991: 'Iron Bundle',
  992: 'Iron Hands',
  993: 'Iron Jugulis',
  994: 'Iron Moth',
  995: 'Iron Thorns',
  996: 'Frigibax',
  997: 'Arctibax',
  998: 'Baxcalibur',
  999: 'Gimmighoul',
  1000: 'Gholdengo',
  1001: 'Wo-Chien',
  1002: 'Chien-Pao',
  1003: 'Ting-Lu',
  1004: 'Chi-Yu',
  1005: 'Roaring Moon',
  1006: 'Iron Valiant',
  1007: 'Koraidon',
  1008: 'Miraidon',
  1009: 'Walking Wake',
  1010: 'Iron Leaves',
  1011: 'Dipplin',
  1012: 'Poltchageist',
  1013: 'Sinistcha',
  1014: 'Okidogi',
  1015: 'Munkidori',
  1016: 'Fezandipiti',
  1017: 'Ogerpon',
  1018: 'Archaludon',
  1019: 'Hydrapple',
  1020: 'Gouging Fire',
  1021: 'Raging Bolt',
  1022: 'Iron Boulder',
  1023: 'Iron Crown',
  1024: 'Terapagos',
  1025: 'Pecharunt',
};

// Form suffixes to strip when the PokeAPI returns a form variant as the "base" entry
const FORM_SUFFIXES = [
  '-normal', '-altered', '-land', '-ordinary', '-aria', '-incarnate',
  '-baile', '-midday', '-solo', '-shield', '-average', '-disguised',
  '-amped', '-ice', '-full-belly', '-single-strike', '-green-plumage',
  '-family-of-four', '-two-segment', '-zero', '-curly', '-plant',
  '-male', '-female', '-red-striped', '-red-meteor', '-east', '-west',
  '-north', '-south', '-spring', '-summer', '-autumn', '-winter',
  '-sunny', '-rainy', '-snowy', '-overcast', '-sandy', '-trash',
  '-white-striped', '-original-color', '-blue-striped', '-natural',
  '-heart', '-star', '-diamond', '-dewy',
];

// Special multi-word names that use hyphens but should NOT become spaces
const HYPHEN_KEEP = new Set([
  'ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o',
  'type-null', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini',
  'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu',
]);

function pokeApiNameToDisplay(apiName: string): string {
  // Strip form suffixes
  for (const suffix of FORM_SUFFIXES) {
    if (apiName.endsWith(suffix)) {
      apiName = apiName.slice(0, -suffix.length);
      break;
    }
  }

  // Special character replacements
  const specials: Record<string, string> = {
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'farfetchd': "Farfetch'd",
    'sirfetchd': "Sirfetch'd",
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'mr-rime': 'Mr. Rime',
    'flabebe': 'Flabébé',
    'porygon2': 'Porygon2',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'type-null': 'Type: Null',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',
    'wo-chien': 'Wo-Chien',
    'chien-pao': 'Chien-Pao',
    'ting-lu': 'Ting-Lu',
    'chi-yu': 'Chi-Yu',
    'great-tusk': 'Great Tusk',
    'scream-tail': 'Scream Tail',
    'brute-bonnet': 'Brute Bonnet',
    'flutter-mane': 'Flutter Mane',
    'slither-wing': 'Slither Wing',
    'sandy-shocks': 'Sandy Shocks',
    'iron-treads': 'Iron Treads',
    'iron-bundle': 'Iron Bundle',
    'iron-hands': 'Iron Hands',
    'iron-jugulis': 'Iron Jugulis',
    'iron-moth': 'Iron Moth',
    'iron-thorns': 'Iron Thorns',
    'roaring-moon': 'Roaring Moon',
    'iron-valiant': 'Iron Valiant',
    'walking-wake': 'Walking Wake',
    'iron-leaves': 'Iron Leaves',
    'gouging-fire': 'Gouging Fire',
    'raging-bolt': 'Raging Bolt',
    'iron-boulder': 'Iron Boulder',
    'iron-crown': 'Iron Crown',
  };

  if (specials[apiName]) return specials[apiName];

  // General rule: capitalize each word, replace hyphens with spaces
  return apiName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main() {
  console.log('Fetching Pokemon names from PokeAPI...');
  const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
  if (!resp.ok) throw new Error(`PokeAPI error: ${resp.status}`);
  const data = (await resp.json()) as { results: { name: string; url: string }[] };

  const rows = data.results.map((p, idx) => {
    const dexId = idx + 1;
    const name = OVERRIDES[dexId] ?? pokeApiNameToDisplay(p.name);
    return { dexId, name };
  });

  console.log(`Inserting ${rows.length} Pokemon...`);

  // Insert in batches of 100 to avoid query size limits
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    await db
      .insert(pokemonDex)
      .values(batch)
      .onConflictDoUpdate({
        target: pokemonDex.dexId,
        set: { name: pokemonDex.name },
      });
    console.log(`  Inserted ${Math.min(i + 100, rows.length)}/${rows.length}`);
  }

  console.log('Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
