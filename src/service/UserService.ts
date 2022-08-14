export type UserData = {
  id: string;
  userName: string;
  roomName: string;
}

export default class UserService{
  private userMap: Map<string, UserData> //Map需key跟value對起來 所以key=string value的內容是=UserData

  constructor(){
    this.userMap = new Map();
  }

  addUser(data: UserData){
    this.userMap.set(data.id, data)
  }

  removeUser(id: string){
    if(this.userMap.has(id)){
      this.userMap.delete(id)
    }
  }

  getUser(id: string){
    if(!this.userMap.has(id)) return null

    const data = this.userMap.get(id)
    if(data) return data

    return null
  }

  userDataInfoHandler(id: string, userName: string, roomName: string){
    return {
      id,
      userName,
      roomName
    }
  }
}