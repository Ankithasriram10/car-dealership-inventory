import { createApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
if (config.jwtSecret === 'dev-only-secret-change-me') {
  console.warn('[warn] JWT_SECRET not set - using an insecure development secret.');
}
const { app } = createApp({ dbPath: config.dbPath, jwtSecret: config.jwtSecret });
app.listen(config.port, () => console.log(`Dealership API listening on http://localhost:${config.port}`));
