// import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express, { json, urlencoded, rest, notFound, errorHandler } from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import { Application } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import authentication from './authentication';
import mongodb from './mongodb';
import { getRegisteredServices } from './utils/registered-services';
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());
// export type HookContext<T = any> = {
//   app: Application;
// } & FeathersHookContext<T>;

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(compress());
app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
// app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(rest());
app.configure(
  socketio(function (io) {
    io.on('connection', async (socket) => {
      const registeredServices = await getRegisteredServices(app);
      socket.emit('init', {
        auth: app.get('authentication').enabled,
        services: registeredServices,
      });
    });
  }),
);

if (app.get('database') === 'mongodb') {
  app.configure(mongodb);
}

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);
if (app.get('authentication').enabled) {
  app.configure(authentication);
}

// Set up our services (see `services/index.ts`)
app.configure(services);

// Set up event channels (see channels.ts)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(errorHandler({ logger }));

app.hooks(appHooks);

export default app;
