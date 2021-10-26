import { Tile, TileState, TileState } from "./Tile"
import { Event } from "../utils/Event"
import { shuffle, chunkArray, randomInteger } from "../utils/Utils"


export const enum GridState {
    Stable = 0,
    CheckCanMove,
    Move,
    FullStop
}

export const enum GridChangesType {
    Simple = 0,
    Booster,
    Reshufle
}


export class GridChangesInfo {
    private _type: GridChangesType
    private _removedTiles: Array<Tile>
    private _dropTiles: Array<Tile>
    private _updateStateTiles: Array<Tile>
    private _reshafle: boolean
    private _booster: Tile

    constructor(type: GridChangesType, removed?: Array<Tile>, drop?: Array<Tile>, updateState?: Array<Tile>, reshafle?: boolean, booster?: Tile) {
        this._type = type
        this._removedTiles = removed ? removed : []
        this._dropTiles = drop ? drop : []
        this._updateStateTiles = updateState ? updateState : []
        this._reshafle = reshafle
        this._booster = booster
    }
    get type() { return this._type }
    get removedTiles () { return this._removedTiles }
    get dropTiles () { return this._dropTiles }
    get updateStateTiles() { return this._updateStateTiles }
    get reshafle() { return this._reshafle }
    get booster() { return this._booster }

}

export class Grid {
    private _size: cc.Vec2 = null
    private _board: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []

    private _colors = [TileState.Red, TileState.Blue, TileState.Green, TileState.Purple, TileState.Yellow]
    private _lineBombs = [TileState.Horizontal, TileState.Vertical]

    boosterBombCount = 7
    megaBombBooster = 5
    reshafleBooster = 3

    bombRadius = 1

    constructor(size: cc.Vec2) {
       this._size = size
    }

    onChangeGrid = new Event
    onAddTile = new Event

    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get board() { return this._board }
    getTile(pos: cc.Vec2) { return this._board[pos.x][pos.y] }
    getListConnectedTiles(pos: cc.Vec2) {
        this._connectedTilesArray = []
        let tileColor = this.getTile(pos).state
        this._findConnectedTiles(pos, tileColor)
        return this._connectedTilesArray
    }

    addTiles() {
        for (let row = 0; row < this._size.x; row++) {
            this._board.push([])
            for (let column = 0; column < this._size.y; column++) {
                let tile = new Tile(cc.v2(row, column))
                tile.onAction.add(this, this._changeGrid.bind(this))
                this._board[row].push(tile)
                this.onAddTile.dispatch(tile)
            } 
        }
    }

    removeConnectedTiles(pos: cc.Vec2) {
        let tiles = this.getListConnectedTiles(pos)
        tiles.forEach((removedTile: Tile) => this.getTile(removedTile.pos).remove())
        return tiles
    }

    dropTiles() {
        // TODO Возвращать конечное состояните
        let r = []
        let rTest = []
        for (let i = this.rowsCount - 2; i >= 0; i--) {
            for (let j = 0; j < this.columnCount; j++) {
                let emptySpaces = this._emptySpacesBelow(i, j)
                if (this.getTile(cc.v2(i, j)).isNormal && emptySpaces > 0) {
                    r.push(this.getTile(cc.v2(i, j)))
                    rTest = rTest.concat(this._swapTile(cc.v2(i, j), cc.v2(i + emptySpaces, j)))
                    // this._swapTile(cc.v2(i, j), cc.v2(i + emptySpaces, j))
                }
            }
        }
        return r
    }

    fillGrid() {
        // let r = []
        for (let i = 0; i < this.columnCount; i++) {
            if (this._board[0][i].isRemoved) {
                let emptySpaces = this._emptySpacesBelow(0, i) + 1
                for (let j = 0; j < emptySpaces; j++) {
                    this._board[j][i].updateState()
                    // r.push(this._board[j][i])
                }
            }
        }
        // return r
    }

    private _findConnectedTiles(pos: cc.Vec2, color) {
        if (!this._isValidPick(pos)) return

        let tile = this.getTile(pos)
        if (tile.isRemoved) return
        
        if (tile.state == color && !this._isCheckTile(tile)) {
            // TODO push tile
            this._connectedTilesArray.push(tile)
            this._findConnectedTiles(cc.v2(pos.x + 1, pos.y), color)
            this._findConnectedTiles(cc.v2(pos.x - 1, pos.y), color)
            this._findConnectedTiles(cc.v2(pos.x, pos.y + 1), color)
            this._findConnectedTiles(cc.v2(pos.x, pos.y - 1), color)
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

    private _isValidPick = (pos: cc.Vec2) => this._board[pos.x]?.[pos.y] != null

    private _emptySpacesBelow(row: number, column: number) {
        // TODO Use reduse
        let result = 0
        if (row !== this.rowsCount) {
            for (let i = row + 1; i < this.rowsCount; i++) {
                this.getTile(cc.v2(i, column)).isRemoved && result++ 
            }
        }
        return result
    }

    private _swapTile(fromPos: cc.Vec2, toPos: cc.Vec2) {
        // TODO 4eto sdelat
        let fromTile = Object.assign(this.getTile(fromPos))
        this._board[fromPos.x][fromPos.y] = Object.assign(this.getTile(toPos))
        this._board[fromPos.x][fromPos.y].updatePos(cc.v2(fromPos.x, fromPos.y))

        this._board[toPos.x][toPos.y] = Object.assign(fromTile)
        this._board[toPos.x][toPos.y].updatePos(cc.v2(toPos.x, toPos.y))

        return [this._board[fromPos.x][fromPos.y], this._board[toPos.x][toPos.y]]
    }

    private _createBomb(tile: Tile) {
        // TODO
        let bombType
        if (this._connectedTilesArray.length >= this.megaBombBooster) {
            bombType = TileState.RemoveAll
        } else if (this._connectedTilesArray.length >= this.reshafleBooster) {
            bombType = TileState.Reshafle
        } else if (this._connectedTilesArray.length >= this.boosterBombCount) {
            let types = [TileState.Horizontal, TileState.Vertical, TileState.Bomb]
            let type = types[randomInteger(0, 2)]
            bombType = type
        } 
        tile.createBomb(bombType)
    } 
    
    private _useline(tile: Tile) {
        let r = []
        let isVertical = tile.state == TileState.Vertical
        let lineLenght = isVertical ? this._size.y : this._size.x
        for (let line = 0; line < lineLenght; line++) {
            if (isVertical) {
                this._board[tile.pos.x][line].remove()
                r.push(this._board[tile.pos.x][line])
            } else {
                this._board[line][tile.pos.y].remove()
                r.push(this._board[line][tile.pos.y])
            }
        } 
        return r
    }

    private _useBomb(tile: Tile) {
        let r = []
        let size = this.bombRadius
        for (let row = tile.pos.x - size; row <= tile.pos.x + size; row++) {
            for (let column = tile.pos.y - size; column <= tile.pos.y + size; column++) {
                if (this._isValidPick(cc.v2(row, column))) {
                    this._board[row][column].remove()
                    r.push(this._board[row][column])
                }
            } 
        } 
        return r
    }

    private _useSuperBomb() {
        let r = []
        for (let row = 0; row < this._size.x; row++) {
            for (let column = 0; column < this._size.y; column++) {
                this._board[row][column].remove()
                r.push(this._board[row][column])
            }
        }
        return r
    }

    private _reshufleGrid() {
        const updateAllTiles = () => {
            for (let row = 0; row < this._size.x; row++) {
                for (let column = 0; column < this._size.y; column++) {
                    this._board[row][column].updatePos(cc.v2(row, column))
                }
            }
        }
        let allTiles = []
        this._board.forEach(r => allTiles = allTiles.concat(r))
        shuffle(allTiles)
        let newBoard = chunkArray(allTiles, this._size.x)
        this._board = newBoard
        updateAllTiles()

        return allTiles
    }

    private _checkGame() {
        for (let row = 0; row < this._size.x; row++) {
            for (let column = 0; column < this._size.y; column++) {
                this.getListConnectedTiles(cc.v2(row, column))
                if (this._connectedTilesArray.length > 1) {
                    return true
                }
            }
        }
        this._connectedTilesArray = []
        return false
    }

    private _changeGrid(tile: Tile) {
        cc.log("BOSTER", tile.isBooster)
        if (tile.isBooster) {
            let removedTiles = []
            switch(tile.state) {
                case TileState.Bomb: 
                    removedTiles = this._useBomb(tile); break
                case TileState.RemoveAll:
                    removedTiles = this._useSuperBomb(); break
                // case TileState.Reshafle:
                //     removedTiles = this._reshufle(tile); break
                case TileState.Horizontal:
                case TileState.Vertical:
                    removedTiles = this._useline(tile); break
            }
            let dropTiles = this.dropTiles()
            this.fillGrid()
            this.onChangeGrid.dispatch(new GridChangesInfo(GridChangesType.Booster, removedTiles, dropTiles, removedTiles))
        } else {
            let tiles = this.getListConnectedTiles(tile.pos)
            if (tiles.length <= 1) {
                tile.onNoCombo.dispatch()
                return
            }
            let removedTiles = this.removeConnectedTiles(tile.pos)
            if (removedTiles.length >= this.boosterBombCount) this._createBomb(tile)
            let dropTiles = this.dropTiles()
            this.fillGrid()
            this._connectedTilesArray = []
            this.onChangeGrid.dispatch(new GridChangesInfo(GridChangesType.Simple, removedTiles, dropTiles, removedTiles, false, removedTiles.length >= this.boosterBombCount ? tile : null))
        }
    }

    logBoard() {
        if (this._board) {
            let log = []
            for (let row = 0; row < this._size.x; row++) {
                log.push([])
                for (let column = 0; column < this._size.y; column++) {
                    log[row].push([this._board[row][column].state, this._board[row][column].pos.x, this._board[row][column].pos.y])
                } 
            }
            cc.log(log)
        }
    }
} 