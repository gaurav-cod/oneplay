export class VideoModel {
  readonly id: string;
  readonly gameId: string;
  readonly gameName: string;
  readonly source: "youtube" | "twitch" | "self";
  readonly isEdited: boolean;
  readonly status: string;
  readonly addedAt: Date;
  readonly updatedAt: Date;
  readonly contentId: string;
  readonly sourceViews: number;
  readonly duration: string;
  readonly title: string;
  readonly sourceLink: string;
  readonly description: string;
  readonly creatorId: string;
  readonly creatorLink: string;
  readonly creatorName: string;
  readonly creatorThumbnail: string;
  readonly thumbnail: string;
  readonly isLive: boolean;
  readonly contentType: string;

  constructor(data: any) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.gameName = data.game_name;
    this.source = data.source;
    this.isEdited = data.is_edited;
    this.status = data.status;
    this.addedAt = new Date(data.added_at * 1000);
    this.updatedAt = new Date(data.updated_at * 1000);
    this.contentId = data.content_id;
    this.sourceViews = data.source_views;
    this.duration = data.duration;
    this.title = data.title;
    this.sourceLink = data.source_link;
    this.description = data.description;
    this.creatorId = data.creator_id;
    this.creatorLink = data.creator_link;
    this.creatorName = data.creator_name;
    this.creatorThumbnail = data.creator_thumbnail;
    this.thumbnail = data.thumbnail;
    this.isLive = data.is_live;
    this.contentType = data.content_type;
  }
}
