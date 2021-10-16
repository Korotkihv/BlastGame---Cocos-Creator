import { Tile } from "./Tile"


export const enum GridState {
    Stable = 0,
    FullStop
}

export class Grid {
    private _size: cc.Vec2 = null
    private _board: Array<Array<Tile>> = []
    private _connectedTilesArray = []

    constructor(size: cc.Vec2) {
       this._size = size
    }

    addTiles() {
        for (let row = 0; row < this._size.x; row++) {
            this._board.push([])
            for (let column = 0; column < this._size.y; column++) {
                this._board[row].push(new Tile(new cc.Vec2(row, column)))
            } 
        }
    }

    getListConnectedTiles(row, column) {
        this._connectedTilesArray = []
        let tileColor = this._board[row][column].color
        this._findConnectedTiles(row, column, tileColor)
        return this._connectedTilesArray
    }

    private _findConnectedTiles(row, column, color) {
        if (!this._isValidPick(row, column)) {
            return
        }
        if (this._board[row][column].color == color && !this._isCheckTile(row, column)) {
            this._connectedTilesArray.push({
                row: row,
                column: column
            })
            this._findConnectedTiles(row + 1, column, color)
            this._findConnectedTiles(row - 1, column, color)
            this._findConnectedTiles(row, column + 1, color)
            this._findConnectedTiles(row, column - 1, color)
        }
    }

    private _isCheckTile(row, column) {
        let found = false
        this._connectedTilesArray.forEach(item => {
            if (item.row === row && item.column === column) {
                found = true
            }
        })
        return found
    }

    private _isValidPick(row, column) {
        return row >= 0 && row < this._size.x && 
            column >= 0 && column < this._size.y && 
            this._board[row] && this._board[row][column]
    }

    logBoard() {
        if (this._board) {
            let log = []
            for (let row = 0; row < this._size.x; row++) {
                log.push([])
                for (let column = 0; column < this._size.y; column++) {
                    log[row].push(this._board[row][column].color)
                } 
            }
            cc.log(log)
        }
    }
} 