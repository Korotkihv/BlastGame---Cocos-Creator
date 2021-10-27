import { randomInteger } from "../utils/Utils"
import { Event } from "../utils/Event"

export const enum TileState {
    Empty,
    Red,
    Blue,
    Green,
    Purple,
    Yellow,
    CountColor,

    Bomb,
    Horizontal,
    Vertical,
    Reshafle,
    RemoveAll,
    BoosterCount
}

export class Tile {
    private _pos: cc.Vec2
    private _state: TileState

    onAction = new Event
    onNoCombo = new Event

    get state() { return this._state }
    get pos() { return this._pos }
    get isRemoved() { return this._state == TileState.Empty }
    get isNormal() { return this._state != TileState.Empty && this._state != TileState.CountColor && this._state != TileState.BoosterCount }
    get isBooster() { return this.state > TileState.CountColor && this.state < TileState.BoosterCount}
    
    set state(s: TileState) { this._state = s }

    static getRandomTile() {
        return randomInteger(TileState.Red, TileState.CountColor - 1)
    }

    constructor(pos: cc.Vec2, color?: TileState) {
        this._pos = pos
        this._state = color ? color : Tile.getRandomTile()
    }

    compare(tile: Tile) {
        return tile.pos.x == this.pos.x && tile.pos.y == this.pos.y
    }
    
    action() { 
        this.onAction.dispatch(this) 
    }

    noCombo() {
        this.onNoCombo.dispatch()
    }

    remove() {
        this._state = TileState.Empty
    }

    updatePos(newPos: cc.Vec2) {
        this._pos = newPos
    }

    updateState() {
        this._state = Tile.getRandomTile()
    }

    createBomb(state: TileState) {
        this._state = state
    }
}