import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(0); // Disable cache to avoid localStorage quota issues with large results

export default tcgdex;
