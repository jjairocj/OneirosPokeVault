import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(3600); // cache 1 hour

export default tcgdex;
