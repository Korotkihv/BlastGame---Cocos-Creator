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

    // TODO rename
    onAction = new Event
    onRemove = new Event
    onUpdatePosition = new Event
    onUpdate = new Event
    onNoCombo = new Event

    get state() { return this._state }
    get pos() { return this._pos }
    get isRemoved() { return this._state == TileState.Empty }
    get isNormal() { return this._state != TileState.Empty && this._state != TileState.CountColor && this._state != TileState.BoosterCount }
    get isBooster() { return this.state > TileState.CountColor && this.state < TileState.BoosterCount}
        // .includes('car') }
    
    set state(s: TileState) { this._state = s }

    static getRandomTile() {
        return randomInteger(TileState.Red, TileState.CountColor - 1)
    }

    constructor(pos: cc.Vec2, color?: TileState) {
        this._pos = pos
        this._state = color ? color : Tile.getRandomTile()
    }
    
    action() { 
        // cc.log("[TILE] action", this)
        this.onAction.dispatch(this) 
    }

    noCombo() {
        this.onNoCombo.dispatch()
    }

    remove() {
        // cc.log("[TILE] remove", this)
        this._state = TileState.Empty
        this.onRemove.dispatch(this)
    }

    updatePos(newPos: cc.Vec2) {
        // cc.log("[TILE] update position", newPos, this)
        this._pos = newPos
        this.onUpdatePosition.dispatch(newPos)
    }

    updateState() {
        // cc.log("[TILE] old state", this)
        this._state = Tile.getRandomTile()
        // cc.log("[TILE] new state", this)
        this.onUpdate.dispatch(this)
    }

    createBomb(state: TileState) {
        this._state = state
    }
}