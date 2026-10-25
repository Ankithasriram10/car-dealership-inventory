/** Reads runtime configuration from the environment with safe local defaults. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    port: Number(env.PORT ?? 4000),
    dbPath: env.DB_PATH ?? './data/dealership.db',
    jwtSecret: env.JWT_SECRET ?? 'dev-only-secret-change-me',
  };
}
