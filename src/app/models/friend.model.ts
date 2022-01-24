export class FriendModel {
    readonly id: string;
    readonly status: string;
    readonly accepted_at: Date | null;
    readonly created_at: Date;
    readonly updated_at: Date;
    readonly user_id: string;
    readonly username: string | null;
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly last_login_timestamp: Date;
    readonly profile_image: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.status = data.status;
        this.accepted_at = data.accepted_at ? new Date(data.accepted_at) : null;
        this.created_at = new Date(data.created_at);
        this.updated_at = new Date(data.updated_at);
        this.user_id = data.user_id;
        this.username = data.username;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.last_login_timestamp = new Date(data.last_login_timestamp);
        this.profile_image = data.profile_image;
    }

    get name(): string {
        return this.first_name + " " + this.last_name;
    }

    copyWith(data: Partial<FriendModel>) {
        return new FriendModel({
            id: this.id,
            status: data.status || this.status,
            accepted_at: data.accepted_at || this.accepted_at,
            created_at: this.created_at,
            updated_at: this.updated_at,
            user_id: this.user_id,
            username: data.username || this.username,
            first_name: data.first_name || this.first_name,
            last_name: data.last_name || this.last_name,
            email: data.email || this.email,
            last_login_timestamp: data.last_login_timestamp || this.last_login_timestamp,
            profile_image: data.profile_image || this.profile_image,
        });
    }
}