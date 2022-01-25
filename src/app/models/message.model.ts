export class MessageModel {
  message: string;
  sender: string;
  receiver: string;
  read: boolean;
  otherData: any;
  createdAt: Date;

  constructor(json: { [key: string]: any }) {
    this.message = json.message;
    this.sender = json.sender || json.senderId;
    this.receiver = json.receiver || json.group || json.streamId;
    this.read = json.read;
    this.otherData = json.otherData;
    this.createdAt = json.created ? new Date(json.created) : new Date();
  }
}
