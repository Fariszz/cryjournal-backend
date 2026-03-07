import { relations } from 'drizzle-orm';
import { primaryKey, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, uuidPk } from './common';
import { users } from './users.schema';

export const roles = pgTable(
  'roles',
  {
    id: uuidPk(),
    name: varchar('name', { length: 64 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    rolesNameUnique: uniqueIndex('roles_name_unique').on(table.name),
  }),
);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (table) => ({
    userRolesPk: primaryKey({ columns: [table.userId, table.roleId] }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));
