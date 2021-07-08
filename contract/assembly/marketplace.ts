import { context, ContractPromiseBatch, u128 } from "near-sdk-as";

import { LandParcel } from "./model";

// TODO: Probably needs to take a range instead of returning all?
export function getLandParcelRange(x: i32, y: i32, width: i32, height: i32): LandParcel[] {
    const parcel: LandParcel[] = [];
    for (let i = 0; i < x + width; i++) {
        for (let j = 0; j < y + height; j++) {
            parcel.push(LandParcel.get(i, j));
        }
    }
    return parcel;
}

export function offerParcel(x: i32, y: i32, price: u128): void {
    const parcel = LandParcel.get(x, y);
    parcel.price = price;
    parcel.save();
}

export function buyParcel(x: i32, y: i32): void {
    const parcel = LandParcel.get(x, y);
    assert(parcel.price > u128.Zero, "Parcel not for sell");
    assert(context.attachedDeposit == parcel.price, "Attached amount of NEAR is not correct.");
    const old_owner = parcel.owner;
    parcel.owner = context.predecessor;
    parcel.save();
    sendNear(old_owner, parcel.price);
}

function sendNear(recipient: string, amount: u128): void {
    ContractPromiseBatch.create(recipient).transfer(amount);
}