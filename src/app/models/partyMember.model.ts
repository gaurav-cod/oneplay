import { UserModel } from "./user.model";

export class PartyMemberModel {
  readonly id: string;
  readonly role: "member" | "admin";
  readonly acceptedAt: Date | null;
  readonly user: UserModel;

  constructor(json: any) {
    this.id = json.id;
    this.role = json.role;
    this.acceptedAt = !!json.acceptedAt ? new Date(json.acceptedAt) : null;
    this.user = new UserModel(json.user);
  }

  copyWith(party: Partial<PartyMemberModel>): PartyMemberModel {
    return new PartyMemberModel({
      id: this.id,
      role: party.role || this.role,
      acceptedAt: party.acceptedAt || this.acceptedAt,
      user: this.user,
    });
  }
}
