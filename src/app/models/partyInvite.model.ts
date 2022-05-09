import { PartyModel } from "./party.model";

export class PartyInviteModel {
  readonly id: string;
  readonly userId: string;
  readonly party: PartyModel | null;
  readonly invitedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly status: "pending" | "accepted";

  constructor(json: any) {
    this.id = json.id;
    this.userId = json.userId;
    this.party = !!this.party ? new PartyModel(json.group) : null;
    this.invitedBy = json.invitedBy;
    this.createdAt = new Date(json.createdAt);
    this.updatedAt = new Date(json.updatedAt);
    this.status = json.status;
  }
}
