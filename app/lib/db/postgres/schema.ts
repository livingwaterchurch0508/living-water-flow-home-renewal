import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const hymns = pgTable('hymns', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  desc: varchar('desc', { length: 256 }),
  url: varchar('url', { length: 256 }).notNull(),
  type: integer('type').default(0).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  nameEn: varchar('nameEn', { length: 512 }),
  descEn: varchar('descEn', { length: 512 }),
});

export const sermons = pgTable('sermons', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  desc: varchar('desc', { length: 256 }),
  url: varchar('url', { length: 256 }).notNull(),
  type: integer('type').default(0).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  nameEn: varchar('nameEn', { length: 512 }),
  descEn: varchar('descEn', { length: 512 }),
});

export const communities = pgTable('communities', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  desc: varchar('desc', { length: 256 }),
  type: integer('type').default(1).notNull(),
  url: varchar('url', { length: 256 }).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  nameEn: varchar('nameEn', { length: 512 }),
  descEn: varchar('descEn', { length: 512 }),
});

export const files = pgTable('files', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey().notNull(),
  communityId: integer('community_id')
    .references(() => communities.id)
    .notNull(),
  url: varchar('url', { length: 256 }).notNull(),
  caption: varchar('caption', { length: 256 }),
  downloadCount: integer('downloadCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  captionEn: varchar('captionEn', { length: 512 }),
});
