import { pgTable, serial, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';

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
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collections = pgTable(
  'collections',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    entryName: text('entry_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.entryName)]
);

export const ownedCards = pgTable(
  'owned_cards',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    cardId: text('card_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.cardId)]
);

export const pokemonDex = pgTable('pokemon_dex', {
  dexId: integer('dex_id').primaryKey(),
  name: text('name').notNull(),
});

export const masterdexSlots = pgTable(
  'masterdex_slots',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    slotType: text('slot_type').notNull(), // 'pokemon', 'trainer', 'energy'
    slotKey: text('slot_key').notNull(), // dexId for pokemon, cardId for others
    cardId: text('card_id'), // TCGdex card ID
    cardName: text('card_name'), // Card name for display
    cardImage: text('card_image'), // Card image URL
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.slotType, t.slotKey)]
);

export const collectionReports = pgTable('collection_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reportData: text('report_data').notNull(), // JSON string
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
