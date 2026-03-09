import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UILanguage = 'en' | 'es';

const translations = {
  en: {
    // Header
    'header.signIn': 'Sign In',
    'header.logout': 'Logout',
    // Landing
    'landing.title': 'Track your Pokemon TCG collection',
    'landing.subtitle': 'Search for any Pokemon, trainer, or energy card and track which cards you own across all sets. Sign in to get started.',
    'landing.cta': 'Get Started Free',
    'landing.setsAvailable': 'sets available',
    'landing.heroTitle': 'Your Pokemon TCG Collection, Perfected',
    'landing.heroSubtitle': 'Track every card you own across all expansions. Build master sets, search by Pokemon or set name, and never lose track of your collection again.',
    'landing.free': 'Free forever. No credit card required.',
    'landing.featuresTitle': 'Everything you need to master your collection',
    'landing.f1Title': 'Search by Pokemon',
    'landing.f1Desc': 'Find every card featuring your favorite Pokemon across all sets with smart autocomplete.',
    'landing.f2Title': 'Complete Sets',
    'landing.f2Desc': 'Track entire expansions like Ascended Heroes or Base Set and see your progress at a glance.',
    'landing.f3Title': 'Progress Tracking',
    'landing.f3Desc': 'Visual progress bars show exactly how close you are to completing each collection.',
    'landing.f4Title': 'TCG & Pocket',
    'landing.f4Desc': 'Track cards from both the physical TCG and Pokemon TCG Pocket in one place.',
    'landing.f5Title': 'Multi-language',
    'landing.f5Desc': 'View card details in English, Spanish, French, Italian, Portuguese, or German.',
    'landing.f6Title': 'Mobile Ready',
    'landing.f6Desc': 'Fully responsive design. Track your collection anywhere, on any device.',
    'landing.pricingTitle': 'Simple, transparent pricing',
    'landing.freePlan': 'Free',
    'landing.forever': 'forever',
    'landing.freeF1': 'Up to 5 collections',
    'landing.freeF2': 'Full card details and search',
    'landing.freeF3': 'TCG & Pocket tracking',
    'landing.proPlan': 'Pro',
    'landing.proPrice': '$4.99',
    'landing.month': 'month',
    'landing.proF1': 'Unlimited collections',
    'landing.proF2': 'Priority support',
    'landing.proF3': 'Export collection data',
    'landing.proCta': 'Upgrade to Pro',
    'landing.footer': 'Pokemon and all related trademarks are property of Nintendo / Creatures Inc. / GAME FREAK Inc. This is a fan-made tool.',
    // AddBar
    'addBar.placeholder': 'Search Pokemon, trainer, or energy...',
    'addBar.placeholderSet': 'Search a set (e.g. Ascended Heroes, Base Set...)',
    'addBar.button': 'Add',
    'addBar.modePokemon': 'Pokemon',
    'addBar.modeSet': 'Set',
    // EntryView
    'entry.noCards': 'No cards found for',
    'entry.error': 'Error loading cards',
    'entry.all': 'All',
    'entry.tcg': 'TCG',
    'entry.pocket': 'Pocket',
    // CardItem
    'card.owned': 'Remove',
    'card.notOwned': 'I have it!',
    'card.confirmDelete': 'Are you sure you want to remove this card from your collection?',
    'card.details': 'Details',
    // Detail Modal
    'detail.title': 'Card Details',
    'detail.set': 'Set',
    'detail.rarity': 'Rarity',
    'detail.artist': 'Artist',
    'detail.hp': 'HP',
    'detail.types': 'Types',
    'detail.stage': 'Stage',
    'detail.category': 'Category',
    'detail.attacks': 'Attacks',
    'detail.abilities': 'Abilities',
    'detail.damage': 'Damage',
    'detail.cost': 'Cost',
    'detail.effect': 'Effect',
    'detail.weakness': 'Weakness',
    'detail.resistance': 'Resistance',
    'detail.retreat': 'Retreat',
    'detail.variants': 'Variants',
    'detail.legal': 'Legality',
    'detail.standard': 'Standard',
    'detail.expanded': 'Expanded',
    'detail.legal.yes': 'Legal',
    'detail.legal.no': 'Not legal',
    'detail.cardLang': 'Card language',
    'detail.close': 'Close',
    'detail.pricing': 'Pricing',
    'detail.dexId': 'Pokedex',
    // Variants filter
    'variant.normal': 'Normal',
    'variant.holo': 'Holo',
    'variant.reverse': 'Reverse',
    'variant.firstEdition': '1st Edition',
    'variant.wPromo': 'W Promo',
    // Empty state
    'empty.title': 'Your vault is empty',
    'empty.subtitle': 'Add a Pokemon name above to start tracking cards',
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loading': 'Loading...',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    // Pro
    'pro.title': 'Upgrade to Pro',
    'pro.description': "You've reached the free plan limit of 5 collection entries. Upgrade to Pro for unlimited entries!",
    'pro.unlimited': 'Unlimited collection entries',
    'pro.support': 'Priority support',
    'pro.export': 'Export collection data',
    'pro.cta': 'Upgrade Now',
    'pro.later': 'Maybe later',
    // Admin
    'admin.title': 'Admin Panel',
    'admin.backHome': 'Back to Home',
    'admin.users': 'Registered Users',
    'admin.total': 'total',
    'admin.plan': 'Plan',
    'admin.role': 'Role',
    'admin.registered': 'Registered',
    'admin.actions': 'Actions',
    'admin.givePro': 'Give Pro',
    'admin.removePro': 'Remove Pro',
    // MasterDex
    'masterdex.back': 'Back',
    'masterdex.baseFilled': 'Pokemon covered',
    'masterdex.variantsCollected': 'variants collected',
    'masterdex.tabBase': 'Base Pokédex',
    'masterdex.tabVariants': 'Special Forms',
    'masterdex.baseInfo': 'Fill each slot with any card of that Pokémon. Valid: Basic, Stage 1/2, EX, V, GX. NOT valid for this tab: Mega, VMAX, VSTAR, Radiant, Regional forms — those go in the Special Forms tab.',
    'masterdex.variantInfo': 'Collect special forms: Mega evolutions, VMAX, VSTAR, Radiant Pokémon, and Regional forms (Hisuian, Galarian, Alolan, Paldean). Each variant has its own slot.',
    'masterdex.addVariant': 'Add Special Form',
    'masterdex.noVariants': 'No special forms yet',
    'masterdex.noVariantsSubtitle': 'Click "Add Special Form" to start collecting Mega, VMAX, VSTAR, Radiant or Regional cards',
    'masterdex.searchCard': 'Search for a card...',
    'masterdex.pickerHintBase': 'Showing standard forms only (excluding Mega, VMAX, VSTAR, Radiant, Regional)',
    'masterdex.pickerHintVariant': 'Showing special forms only (Mega, VMAX, VSTAR, Radiant, Regional & TAG TEAM)',
    'masterdex.noResults': 'No cards found. Try a different search.',
    'masterdex.sortBy': 'Sort',
    'masterdex.sortDex': 'Pokédex #',
    'masterdex.sortAlpha': 'Alphabetical',
    'masterdex.loadingNames': 'Loading names',
    'masterdex.searchPokemon': 'Search Pokémon...',

    // Common
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.warning': 'Warning',

    // Reports
    'report.downloadOwned': 'Download Owned',
    'report.downloadMissing': 'Download Missing',
    'report.csvHeader.name': 'Name',
    'report.csvHeader.expansion': 'Expansion',
    'report.filename.owned': 'owned_cards',
    'report.filename.missing': 'missing_cards',
  },
  es: {
    'header.signIn': 'Iniciar sesion',
    'header.logout': 'Cerrar sesion',
    'landing.title': 'Registra tu coleccion de Pokemon TCG',
    'landing.subtitle': 'Busca cualquier Pokemon, entrenador o carta de energia y registra cuales posees en todos los sets. Inicia sesion para comenzar.',
    'landing.cta': 'Comenzar Gratis',
    'landing.setsAvailable': 'sets disponibles',
    'landing.heroTitle': 'Tu Coleccion Pokemon TCG, Perfeccionada',
    'landing.heroSubtitle': 'Registra cada carta que posees en todas las expansiones. Arma master sets, busca por Pokemon o por nombre de set, y nunca pierdas el rastro de tu coleccion.',
    'landing.free': 'Gratis para siempre. Sin tarjeta de credito.',
    'landing.featuresTitle': 'Todo lo que necesitas para dominar tu coleccion',
    'landing.f1Title': 'Buscar por Pokemon',
    'landing.f1Desc': 'Encuentra cada carta de tu Pokemon favorito en todos los sets con autocompletado inteligente.',
    'landing.f2Title': 'Sets Completos',
    'landing.f2Desc': 'Registra expansiones enteras como Ascended Heroes o Base Set y ve tu progreso de un vistazo.',
    'landing.f3Title': 'Seguimiento de Progreso',
    'landing.f3Desc': 'Barras de progreso visuales muestran exactamente que tan cerca estas de completar cada coleccion.',
    'landing.f4Title': 'TCG y Pocket',
    'landing.f4Desc': 'Registra cartas del TCG fisico y de Pokemon TCG Pocket en un solo lugar.',
    'landing.f5Title': 'Multi-idioma',
    'landing.f5Desc': 'Ve los detalles de las cartas en ingles, espanol, frances, italiano, portugues o aleman.',
    'landing.f6Title': 'Listo para Movil',
    'landing.f6Desc': 'Diseno totalmente responsivo. Registra tu coleccion donde sea, en cualquier dispositivo.',
    'landing.pricingTitle': 'Precios simples y transparentes',
    'landing.freePlan': 'Gratis',
    'landing.forever': 'siempre',
    'landing.freeF1': 'Hasta 5 colecciones',
    'landing.freeF2': 'Detalles completos y busqueda',
    'landing.freeF3': 'Seguimiento TCG y Pocket',
    'landing.proPlan': 'Pro',
    'landing.proPrice': '$4.99',
    'landing.month': 'mes',
    'landing.proF1': 'Colecciones ilimitadas',
    'landing.proF2': 'Soporte prioritario',
    'landing.proF3': 'Exportar datos de coleccion',
    'landing.proCta': 'Mejorar a Pro',
    'landing.footer': 'Pokemon y todas las marcas relacionadas son propiedad de Nintendo / Creatures Inc. / GAME FREAK Inc. Esta es una herramienta hecha por fans.',
    'addBar.placeholder': 'Buscar Pokemon, entrenador o energia...',
    'addBar.placeholderSet': 'Buscar un set (ej: Ascended Heroes, Base Set...)',
    'addBar.button': 'Agregar',
    'addBar.modePokemon': 'Pokemon',
    'addBar.modeSet': 'Set',
    'entry.noCards': 'No se encontraron cartas para',
    'entry.error': 'Error cargando cartas',
    'entry.all': 'Todas',
    'entry.tcg': 'TCG',
    'entry.pocket': 'Pocket',
    'card.owned': 'Quitar',
    'card.notOwned': 'La tengo!',
    'card.confirmDelete': '¿Estás seguro de que quieres quitar esta carta de tu colección?',
    'card.details': 'Detalles',
    'detail.title': 'Detalles de la carta',
    'detail.set': 'Set',
    'detail.rarity': 'Rareza',
    'detail.artist': 'Artista',
    'detail.hp': 'HP',
    'detail.types': 'Tipos',
    'detail.stage': 'Etapa',
    'detail.category': 'Categoria',
    'detail.attacks': 'Ataques',
    'detail.abilities': 'Habilidades',
    'detail.damage': 'Dano',
    'detail.cost': 'Coste',
    'detail.effect': 'Efecto',
    'detail.weakness': 'Debilidad',
    'detail.resistance': 'Resistencia',
    'detail.retreat': 'Retirada',
    'detail.variants': 'Variantes',
    'detail.legal': 'Legalidad',
    'detail.standard': 'Standard',
    'detail.expanded': 'Expanded',
    'detail.legal.yes': 'Legal',
    'detail.legal.no': 'No legal',
    'detail.cardLang': 'Idioma de la carta',
    'detail.close': 'Cerrar',
    'detail.pricing': 'Precios',
    'detail.dexId': 'Pokedex',
    'variant.normal': 'Normal',
    'variant.holo': 'Holo',
    'variant.reverse': 'Reversa',
    'variant.firstEdition': '1a Edicion',
    'variant.wPromo': 'W Promo',
    'empty.title': 'Tu vault esta vacia',
    'empty.subtitle': 'Agrega un nombre de Pokemon arriba para comenzar',
    'auth.signIn': 'Iniciar sesion',
    'auth.signUp': 'Crear cuenta',
    'auth.email': 'Correo',
    'auth.password': 'Contrasena',
    'auth.loading': 'Cargando...',
    'auth.noAccount': 'No tienes cuenta?',
    'auth.hasAccount': 'Ya tienes cuenta?',
    'pro.title': 'Mejorar a Pro',
    'pro.description': 'Has alcanzado el limite del plan gratuito de 5 entradas. Mejora a Pro para entradas ilimitadas!',
    'pro.unlimited': 'Entradas ilimitadas',
    'pro.support': 'Soporte prioritario',
    'pro.export': 'Exportar datos de coleccion',
    'pro.cta': 'Mejorar ahora',
    'pro.later': 'Quiza despues',
    'admin.title': 'Panel de Admin',
    'admin.backHome': 'Volver al inicio',
    'admin.users': 'Usuarios registrados',
    'admin.total': 'total',
    'admin.plan': 'Plan',
    'admin.role': 'Rol',
    'admin.registered': 'Registro',
    'admin.actions': 'Acciones',
    'admin.givePro': 'Dar Pro',
    'admin.removePro': 'Quitar Pro',
    // MasterDex
    'masterdex.back': 'Volver',
    'masterdex.baseFilled': 'Pokemon cubiertos',
    'masterdex.variantsCollected': 'variantes coleccionadas',
    'masterdex.tabBase': 'Pokedex Base',
    'masterdex.tabVariants': 'Formas Especiales',
    'masterdex.baseInfo': 'Llena cada espacio con cualquier carta de ese Pokemon. Valido: Basico, Fase 1/2, EX, V, GX. NO valido en esta pestana: Mega, VMAX, VSTAR, Radiante, Formas Regionales — esas van en la pestana de Formas Especiales.',
    'masterdex.variantInfo': 'Colecciona formas especiales: Mega evoluciones, VMAX, VSTAR, Pokemon Radiantes y Formas Regionales (Hisui, Galar, Alola, Paldea). Cada variante tiene su propio espacio.',
    'masterdex.addVariant': 'Agregar Forma Especial',
    'masterdex.noVariants': 'Sin formas especiales aun',
    'masterdex.noVariantsSubtitle': 'Haz clic en "Agregar Forma Especial" para coleccionar cartas Mega, VMAX, VSTAR, Radiantes o Regionales',
    'masterdex.searchCard': 'Buscar una carta...',
    'masterdex.pickerHintBase': 'Mostrando solo formas estandar (sin Mega, VMAX, VSTAR, Radiante, Regional)',
    'masterdex.pickerHintVariant': 'Mostrando solo formas especiales (Mega, VMAX, VSTAR, Radiante, Regional y TAG TEAM)',
    'masterdex.noResults': 'No se encontraron cartas. Intenta otra busqueda.',
    'masterdex.sortBy': 'Ordenar',
    'masterdex.sortDex': 'Pokédex #',
    'masterdex.sortAlpha': 'Alfabetico',
    'masterdex.loadingNames': 'Cargando nombres',
    'masterdex.searchPokemon': 'Buscar Pokémon...',

    // Common
    'common.confirm': 'Confirmar',
    'common.cancel': 'Cancelar',
    'common.warning': 'Advertencia',

    // Reports
    'report.downloadOwned': 'Descargar Poseidas',
    'report.downloadMissing': 'Descargar Faltantes',
    'report.csvHeader.name': 'Nombre',
    'report.csvHeader.expansion': 'Expansion',
    'report.filename.owned': 'cartas_poseidas',
    'report.filename.missing': 'cartas_faltantes',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: UILanguage;
  setLang: (lang: UILanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UILanguage>(() => {
    const stored = localStorage.getItem('oneiros-pokevault-lang');
    if (stored === 'es' || stored === 'en') return stored;
    return navigator.language.startsWith('es') ? 'es' : 'en';
  });

  const setLang = useCallback((newLang: UILanguage) => {
    setLangState(newLang);
    localStorage.setItem('oneiros-pokevault-lang', newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] || translations.en[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
