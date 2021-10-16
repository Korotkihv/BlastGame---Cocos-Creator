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

export class Tile {
    private _posIndex: cc.Vec2
    private _color: TileColor

    get color() { return this._color }

    static getRandomTile() {
        return randomInteger(TileColor.Red + 1, TileColor.Count - 1)
    }

    constructor(pos: cc.Vec2, color?: TileColor) {
        this._posIndex = pos
        this._color = color ? color : Tile.getRandomTile()
    }
}