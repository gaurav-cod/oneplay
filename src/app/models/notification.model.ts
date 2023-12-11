interface FriendInterface {
    readonly friendId: string;
    readonly friendName: string;
    readonly friendRequestId: string;
}

export class NotificationModel {
    readonly notificationId: string;
    readonly userId: string;
    readonly title: string;
    readonly description: string;
    readonly type: "question";
    readonly subType: "FRIEND_REQUEST";
    readonly isRead: boolean;
    readonly isNew: boolean;
    readonly CTAs: string[];
    readonly deleteAllowed: boolean;
    readonly createdAt: Date;
    readonly data: FriendInterface;

    constructor(data: any) {
        this.notificationId = data["notification_id"];
        this.userId = data["user_id"];
        this.title = data["title"];
        this.description = data["description"];
        this.type = data["type"];
        this.subType = data["sub_type"];
        this.isRead = data["is_read"];
        this.isNew = data["is_new"];
        this.deleteAllowed = data["delete_allowed"];
        this.CTAs = data["CTAs"];
        this.data = data["data"];
        this.createdAt = new Date(data["created_at"] * 1000);;
    }
}