export class PartyModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: "public" | "private";
  readonly createdBy: string;
  readonly totalMembers: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(json: any) {
    this.id = json.id;
    this.name = json.name;
    this.description = json.description;
    this.type = json.type;
    this.createdBy = json.created_by;
    this.totalMembers = json.total_members;
    this.createdAt = new Date(json.created_at);
    this.updatedAt = new Date(json.updated_at);
  }

  copyWith(party: Partial<PartyModel>): PartyModel {
    return new PartyModel({
      id: this.id,
      name: party.name || this.name,
      description: party.description || this.description,
      type: party.type || this.type,
      created_by: this.createdBy,
      total_members: party.totalMembers || this.totalMembers,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    });
  }
}
