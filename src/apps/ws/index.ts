import * as http from 'http';

import * as socketio from 'socket.io';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server, IncomingMessage, ServerResponse } from 'http';
import WebSocketEvent from '../types/webSocketEvent';
class SocketIoService {
  private static instance: SocketIoService;
  private io: socketio.Server;

  private constructor() {}

  public static getInstance(): SocketIoService {
    if (!SocketIoService.instance) {
      SocketIoService.instance = new SocketIoService();
    }
    return SocketIoService.instance;
  }

  public setServer(io: socketio.Server): void {
    this.io = io;
  }

  public getServer(): socketio.Server {
    return this.io;
  }
}
type ConnectedListener = (
  socket: socketio.Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >,
) => void;
type server =
  | Server<typeof IncomingMessage, typeof ServerResponse>
  | Server<typeof IncomingMessage, typeof ServerResponse>;
let io: socketio.Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> = null;
let connected = false;
let connectedListeners: Array<ConnectedListener> = [];
let connectedHosts: Array<string> = [];
class Socket {}
function init(httpServer: server): void {
  let io = new socketio.Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.on('connection', (socket: socketio.Socket) => {
    console.log('New client connected');

    socket.on('message', (data) => {
      console.log('Message received: ', data);
    });
  });
  SocketIoService.getInstance().setServer(io);
  io.on('listening', () => {
    connected = true;
    const listeners = connectedListeners;
    connectedListeners = [];
    listeners.forEach((cb) => {
      cb(io);
    });
  });

  io.on('close', () => {
    connected = false;
    io = null;
  });

  io.on('error', (error: Error) => {
    console.error('Error in WebSocket', error);
  });
}

function publish(
  eventIdentifier: string,
  data: Record<string, any> = null,
): void {
  const io = SocketIoService.getInstance().getServer();

  if (!io) {
    console.error('WebSocket server is not initialized yet');
    return;
  }

  console.log(
    `Broadcasted event "${eventIdentifier}" to ${io.sockets.sockets.size} clients`,
  );

  io.sockets.sockets.forEach((client) => {
    const ev: WebSocketEvent = { eventIdentifier, data };
    client.emit('message', JSON.stringify(ev));
  });
}

export default {
  init,
  publish,
};
