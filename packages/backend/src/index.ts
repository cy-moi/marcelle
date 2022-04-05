import logger from './logger';
import app from './app';

export default async function runBackend(): Promise<void> {
  const port = app.get('port');
  const server = await app.listen(port);

  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason),
  );

  server.on('listening', () => {
    logger.info('Marcelle Backend application started on http://%s:%d', app.get('host'), port);
  });
}
