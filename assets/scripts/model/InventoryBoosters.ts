import Global from "../Global"
import { Event } from "../utils/Event"
import { TileState } from "./Tile"

export class Booster {
    type: TileState
    count = 0

    onChangeCount = new Event

    decremenBoosterCount() {
        this.count--
        this.onChangeCount.dispatch(this.type)
    }
}

export class InventoryBoosters {
    private _inventory: Array<Booster> = []

    constructor() {
        let config = Global.config
        config.inventoryBoostersList.forEach(type => {
            let booster = new Booster()
            booster.type = type
            booster.count = config.defaultBoostersCountForGame
            this._inventory.push(booster)
        })
    }

    get boosters() { return this._inventory }

    onChangeInventory = new Event

    decremenBoosterCount(type: TileState) {
        let booster = this._findBooster(type)
        booster.decremenBoosterCount()
    }

    private _findBooster(type: TileState) {
        return this._inventory.find(b => b.type == type)
    }
}