import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

export const setupWebSocket = (io, sessionMiddleware) => {
  // Convert express middleware to socket.io middleware
  const wrap = middleware => (socket, next) => 
    middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));

  // Authentication middleware
  io.use(async (socket, next) => {
    const session = socket.request.session;
    if (!session?.userId) {
      next(new Error('Unauthorized'));
    } else {
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join room based on user ID for private messages
    const userId = socket.request.session.userId;
    socket.join(`user:${userId}`);

    // Handle real-time updates subscription
    socket.on('subscribe:updates', (data) => {
      const { type, params } = data;
      socket.join(`updates:${type}`);
      logger.info(`Client ${socket.id} subscribed to ${type} updates`);
    });

    socket.on('unsubscribe:updates', (data) => {
      const { type } = data;
      socket.leave(`updates:${type}`);
      logger.info(`Client ${socket.id} unsubscribed from ${type} updates`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for client ${socket.id}:`, error);
    });
  });

  // Error handling
  io.engine.on('connection_error', (err) => {
    logger.error('Connection error:', err);
  });
};