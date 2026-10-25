import { Db } from '../db';
import { Role, User, UserRecord } from '../types';

interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

/** Persistence for users. Only this class knows the users table layout. */
export class UserRepository {
  constructor(private readonly db: Db) {}

  create(input: NewUser): User {
    const info = this.db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(input.name, input.email, input.passwordHash, input.role ?? 'user');
    return { id: Number(info.lastInsertRowid), name: input.name, email: input.email, role: input.role ?? 'user' };
  }

  findByEmail(email: string): UserRecord | undefined {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    return row && this.toRecord(row);
  }

  private toRecord(row: any): UserRecord {
    return { id: row.id, name: row.name, email: row.email, role: row.role, passwordHash: row.password_hash };
  }
}
