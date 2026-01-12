import { Socket, Server as SocketI0Server } from "socket.io";

export function registerUserEvents(io: SocketI0Server, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "its working!!!" });
  });
}
