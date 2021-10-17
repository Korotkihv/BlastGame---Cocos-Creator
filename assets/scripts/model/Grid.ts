import { Tile, TileState } from "./Tile"
import { Event } from "../utils/Event"


export const enum GridState {
    Stable = 0,
    FullStop
}

export class Grid {
    private _size: cc.Vec2 = null
    private _board: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []

    constructor(size: cc.Vec2) {
       this._size = size
    }

    onChangeGrid = new Event

    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get board() { return this._board }
    getTile(pos: cc.Vec2) { return this._board[pos.x][pos.y] }
    getListConnectedTiles(pos: cc.Vec2) {
        this._connectedTilesArray = []
        let tileColor = this.getTile(pos).color
        this._findConnectedTiles(pos, tileColor)
        return this._connectedTilesArray
    }

    addTiles() {
        for (let row = 0; row < this._size.x; row++) {
            this._board.push([])
            for (let column = 0; column < this._size.y; column++) {
                let tile = new Tile(new cc.Vec2(row, column))
                tile.onActivate.add(this, (tile: Tile) => this._changeGrid(tile))
                this._board[row].push(tile)
            } 
        }
    }

    removeConnectedTiles(pos: cc.Vec2) {
        let tiles = this.getListConnectedTiles(pos)
        cc.log(tiles)
        tiles.forEach(removedTile => this.getTile(removedTile.pos).state = TileState.Removed)
    }

    dropTiles() {
        // let result = [];
        for (let i = this.rowsCount - 2; i >= 0; i--) {
            for (let j = 0; j < this.columnCount; j++) {
                let emptySpaces = this._emptySpacesBelow(i, j)
                if (this.getTile(new cc.Vec2(i, j)).isNormal && emptySpaces > 0) {
                    this._swapTile(new cc.Vec2(i, j), new cc.Vec2(i + emptySpaces, j))
                    // result.push({
                    //     row: i + emptySpaces,
                    //     column: j,
                    //     deltaRow: emptySpaces
                    // });
                }
            }
        }
        // return result;
    }

    fillGrid() {
        // let result = [];
        for (let i = 0; i < this.columnCount; i++) {
            if (this._board[0][i].isRemoved) {
                let emptySpaces = this._emptySpacesBelow(0, i) + 1;
                for (let j = 0; j < emptySpaces; j++) {
                    // result.push({
                    //     row: j,
                    //     column: i,
                    //     deltaRow: emptySpaces
                    // });
                    this._board[j][i] = new Tile(new cc.Vec2(j, i))
                }
            }
        }
        // return result;
    }

    private _findConnectedTiles(pos: cc.Vec2, color) {
        if (!this._isValidPick(pos)) return

        let tile = this.getTile(pos)
        if (tile.isRemoved) return
        
        if (tile.color == color && !this._isCheckTile(tile)) {
            // TODO push tile
            this._connectedTilesArray.push(tile)
            this._findConnectedTiles(new cc.Vec2(pos.x + 1, pos.y), color)
            this._findConnectedTiles(new cc.Vec2(pos.x - 1, pos.y), color)
            this._findConnectedTiles(new cc.Vec2(pos.x, pos.y + 1), color)
            this._findConnectedTiles(new cc.Vec2(pos.x, pos.y - 1), color)
        }
    }

    private _isCheckTile(tileCheck: Tile) {
        let found = false
        // TODO replace on find
        this._connectedTilesArray.forEach(tile => {
            if (tile.pos.x === tileCheck.pos.x && tile.pos.y === tileCheck.pos.y) {
                found = true
            }
        })
        return found
    }

    private _isValidPick(pos: cc.Vec2) {
        return pos.x >= 0 && pos.x < this._size.x && 
            pos.y >= 0 && pos.y < this._size.y && 
            this._board[pos.x] && this._board[pos.x][pos.y]
    }

    private _emptySpacesBelow(row: number, column: number) {
        // TODO Use reduse
        let result = 0
        if (row !== this.rowsCount) {
            for (let i = row + 1; i < this.rowsCount; i++) {
                this.getTile(new cc.Vec2(i, column)).isRemoved && result++ 
                // if (this._board[i][column].isRemoved) {
                //     result++;
                // }
            }
        }
        return result
    }

    private _swapTile(fromPos: cc.Vec2, toPos: cc.Vec2) {
        let fromTile = Object.assign(this.getTile(fromPos));
        this._board[fromPos.x][fromPos.y] = Object.assign(this.getTile(toPos));
        this._board[toPos.x][toPos.y] = Object.assign(fromTile);
    }

    private _changeGrid(tile: Tile) {
        cc.log("3")
        this.onChangeGrid.dispatch(this.getListConnectedTiles(tile.pos))
    }

    logBoard() {
        if (this._board) {
            let log = []
            for (let row = 0; row < this._size.x; row++) {
                log.push([])
                for (let column = 0; column < this._size.y; column++) {
                    log[row].push([this._board[row][column].color, this._board[row][column].state])
                } 
            }
            cc.log(log)
        }
    }
} 