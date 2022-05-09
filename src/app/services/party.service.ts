import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { PartyModel } from "../models/party.model";
import { PartyInviteModel } from "../models/partyInvite.model";

@Injectable({
  providedIn: "root",
})
export class PartyService {
  private _$parties: BehaviorSubject<PartyModel[]> = new BehaviorSubject<
    PartyModel[]
  >([]);

  private _$invites: BehaviorSubject<PartyInviteModel[]> = new BehaviorSubject<
    PartyInviteModel[]
  >([]);

  get parties(): Observable<PartyModel[]> {
    return this._$parties.asObservable();
  }
  
  get invites(): Observable<PartyInviteModel[]> {
    return this._$invites.asObservable();
  }

  set parties(parties: Observable<PartyModel[]>) {
    parties.subscribe((parties) => this._$parties.next(parties));
  }

  set invites(invites: Observable<PartyInviteModel[]>) {
    invites.subscribe((invites) => this._$invites.next(invites));
  }

  constructor() {}

  getParty(id: string): PartyModel {
    const parties = this._$parties.getValue();
    return parties.find((party) => party.id === id);
  }

  createParty(party: PartyModel): void {
    const parties = this._$parties.getValue();
    parties.push(party);
    this._$parties.next(parties);
  }

  updateParty(id: string, party: Partial<PartyModel>): void {
    const parties = this._$parties.getValue();
    const index = parties.findIndex((p) => p.id === id);
    parties[index] = parties[index].copyWith(party);
    this._$parties.next(parties);
  }

  increaseMembers(party: PartyModel): void {
    const parties = this._$parties.getValue();
    const index = parties.indexOf(party);
    parties[index] = parties[index].copyWith({
      totalMembers: party.totalMembers + 1,
    });
    this._$parties.next(parties);
  }

  decreaseMembers(party: PartyModel): void {
    const parties = this._$parties.getValue();
    const index = parties.indexOf(party);
    parties[index] = parties[index].copyWith({
      totalMembers: party.totalMembers - 1,
    });
    this._$parties.next(parties);
  }

  acceptInvite(invite: PartyInviteModel): void {
    // add party to parties
    const parties = this._$parties.getValue();
    parties.push(invite.party);
    this._$parties.next(parties);
    // remove invite
    const invites = this._$invites.getValue();
    const index = invites.indexOf(invite);
    invites.splice(index, 1);
    this._$invites.next(invites);
  }

  rejectInvite(invite: PartyInviteModel): void {
    const invites = this._$invites.getValue();
    const index = invites.indexOf(invite);
    invites.splice(index, 1);
    this._$invites.next(invites);
  }
}
