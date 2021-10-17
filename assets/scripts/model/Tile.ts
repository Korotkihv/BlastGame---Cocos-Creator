import { randomInteger } from "../utils/Utils"
import { Event } from "../utils/Event"

export const enum TileColor {
    Red,
    Blue,
    Green,
    Purple,
    Yellow,
    Count
}

export const enum TileState {
    Normal,
    Removed
}

export class Tile {
    private _pos: cc.Vec2
    private _color: TileColor
    private _state: TileState

    // TODO rename
    onActivate = new Event

    get color() { return this._color }
    get state() { return this._state }
    get pos() { return this._pos }
    get isRemoved() { return this._state == TileState.Removed }
    get isNormal() { return this._state == TileState.Normal }
    
    set state(s: TileState) { this._state = s }

    static getRandomTile() {
        return randomInteger(TileColor.Red + 1, TileColor.Count - 1)
    }

    constructor(pos: cc.Vec2, color?: TileColor) {
        this._pos = pos
        this._color = color ? color : Tile.getRandomTile()
        this._state = TileState.Normal
    }
    
    activate() { 
        cc.log("2")
        this.onActivate.dispatch(this) }
}