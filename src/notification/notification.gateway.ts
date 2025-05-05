import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WS } from 'src/common/enum/websocket.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // role admin based
    const role = client.handshake.query.role as string;

    if (role == 'admin') {
      client.join('admin');
    }

    // user id based
    const userId = client.handshake.query.userId as string;

    if (userId) {
      client.join(userId);
    }
  }

  sendNotificationToAdmin(payload: any) {
    this.server.to('admin').emit(WS.ADMIN_NOTIFICATION, payload);
  }

  sendNotificationToUser(userId: string, payload: any) {
    this.server.to(userId).emit(WS.USER_NOTIFICATION, payload);
  }
}
