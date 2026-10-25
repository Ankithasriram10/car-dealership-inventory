import { z } from 'zod';
import { UserRepository } from '../repositories/userRepository';
import { TokenService } from './tokenService';
import { hashPassword, verifyPassword } from './passwordHasher';
import { badRequest, conflict, unauthorized } from '../errors';
import { User } from '../types';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({ email: z.string().trim().toLowerCase(), password: z.string() });

/** Registration and login. Role is never read from client input. */
export class AuthService {
  constructor(private readonly users: UserRepository, private readonly tokens: TokenService) {}

  async register(input: unknown): Promise<User> {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const { name, email, password } = parsed.data;
    if (this.users.findByEmail(email)) throw conflict('Email is already registered');
    return this.users.create({ name, email, passwordHash: await hashPassword(password), role: 'user' });
  }

  async login(input: unknown): Promise<{ token: string; user: User }> {
    const parsed = loginSchema.safeParse(input);
    // Same message for every failure path to avoid user enumeration.
    const fail = () => unauthorized('Invalid email or password');
    if (!parsed.success) throw fail();
    const record = this.users.findByEmail(parsed.data.email);
    if (!record || !(await verifyPassword(parsed.data.password, record.passwordHash))) throw fail();
    const { passwordHash: _omit, ...user } = record;
    return { token: this.tokens.sign(user), user };
  }
}
