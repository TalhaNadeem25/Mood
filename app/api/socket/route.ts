import { Server, Socket } from 'socket.io';
import { NextResponse } from 'next/server';

declare global {
  var io: Server | undefined;
}

const ioHandler = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return new Response('Missing token', { status: 401 });
  }

  if (!global.io) {
    console.log('Initializing Socket.IO server...');
    global.io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    global.io.on('connection', (socket: Socket) => {
      console.log('Client connected');

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  return NextResponse.json({ success: true });
};

export const GET = ioHandler;
export const POST = ioHandler; 