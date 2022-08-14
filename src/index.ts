import devServer from "@/server/dev";
import prodServer from "@/server/prod";
import express from "express";
import { Server } from "socket.io";
import  http from 'http';
import  UserService from '@/service/UserService';
import moment from 'moment';

import { name } from "@/utils";

const port = 3000;
const app = express();
const sever = http.createServer(app);
const io = new Server(sever)
const userService = new UserService();

io.on('connection', (socket) => {
  socket.emit('userID', socket.id)

  socket.on('join', ({userName, roomName}: {userName: string, roomName: string}) => {
    const userData = userService.userDataInfoHandler(
      socket.id, 
      userName, 
      roomName
    );

    //socket.io 的本身事件(join) 
    socket.join(roomName);  

    userService.addUser(userData);

    //to = 發送到這個頻道(roomName)
    socket.broadcast.to(roomName).emit('join', `${userName}加入了${roomName}`)
  })

  //收到前端資料
  //訊息發送到個別的頻道 不會混用
  socket.on('chat', (msg) => {
    const time = moment.utc();
    const userData = userService.getUser(socket.id)
    if(userData){
      // 會用io的原因是自己也要看到自己發送的訊息
      io.to(userData.roomName).emit('chat', {
          msg,
          userData,
          time
        }
      )
    }
    //後端收到後又發回前端
  })

  //socket.io 的本身關閉事件(disconnect) 
  socket.on('disconnect', () => {
    const userData = userService.getUser(socket.id)
    const userName = userData?.userName
    if(userName){
      socket.broadcast.to(userData.roomName).emit('leave', `${userData.userName}離開了聊天室`)
    }
    userService.removeUser(socket.id)
  })
})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

console.log("server side", name);

sever.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
