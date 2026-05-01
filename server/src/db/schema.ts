import { pgTable, serial, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';

// ──── Auth ────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  plan: text('plan').default('free').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ──── Collections ────

export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  entryName: text('entry_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.entryName)]);

export const ownedCards = pgTable('owned_cards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId: text('card_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.cardId)]);

// ──── MasterDex ────

export const pokemonDex = pgTable('pokemon_dex', {
  dexId: integer('dex_id').primaryKey(),
  name: text('name').notNull(),
});

export const masterdexSlots = pgTable('masterdex_slots', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  slotType: text('slot_type').notNull(),
  slotKey: text('slot_key').notNull(),
  cardId: text('card_id'),
  cardName: text('card_name'),
  cardImage: text('card_image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.slotType, t.slotKey)]);

// ──── Reports ────

export const collectionReports = pgTable('collection_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportData: text('report_data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ──── Decks ────

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  format: text('format').notNull(), // 'standard' | 'expanded' | 'unlimited'
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.name)]);

export const deckCards = pgTable('deck_cards', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id').references(() => decks.id, { onDelete: 'cascade' }).notNull(),
  cardId: text('card_id').notNull(),
  cardName: text('card_name').notNull(),
  cardImage: text('card_image'),
  quantity: integer('quantity').default(1).notNull(),
  isBasicEnergy: integer('is_basic_energy').default(0).notNull(),
}, (t) => [unique().on(t.deckId, t.cardId)]);

// ──── Lists ────

export const lists = pgTable('lists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  listType: text('list_type').notNull(), // 'wishlist' | 'trade_binder' | 'custom' | 'pokemon_binder' | 'graded_collection'
  visibility: text('visibility').default('private').notNull(),
  shareSlug: text('share_slug').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.name)]);

export const listCards = pgTable('list_cards', {
  id: serial('id').primaryKey(),
  listId: integer('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
  cardId: text('card_id').notNull(),
  cardName: text('card_name'),
  cardImage: text('card_image'),
  quantity: integer('quantity').default(1).notNull(),
  notes: text('notes'),
}, (t) => [unique().on(t.listId, t.cardId)]);

// ──── Prices ────

export const priceSnapshots = pgTable('price_snapshots', {
  id: serial('id').primaryKey(),
  cardId: text('card_id').notNull(),
  source: text('source').notNull(), // 'tcgplayer' | 'cardmarket'
  price: integer('price').notNull(), // cents
  currency: text('currency').notNull(), // 'USD' | 'EUR'
  snapshotDate: timestamp('snapshot_date', { withTimezone: true }).defaultNow().notNull(),
});

// ──── Profiles ────

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  displayName: text('display_name'),
  bannerImage: text('banner_image'),
  featuredCards: text('featured_cards'), // JSON array of up to 8 card IDs
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cardNotes = pgTable('card_notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId: text('card_id').notNull(),
  note: text('note').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.cardId)]);

// ──── Payments ────

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').notNull(), // 'COP' | 'USD'
  provider: text('provider').notNull(), // 'bold' | 'stripe'
  status: text('status').default('pending').notNull(), // 'pending' | 'completed' | 'failed'
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
