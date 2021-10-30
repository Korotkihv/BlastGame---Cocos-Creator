import { Tile, TileState } from "./Tile"
import { Event } from "../utils/Event"
import { shuffle, chunkArray, randomInteger } from "../utils/Utils"
import Global from "../Global"


export const enum GridState {
    NotReady = 0,
    Ready,
    CheckCanMove,
    Move,
    FullStop
}

export const enum GridChangesType {
    None,
    Simple,
    Booster,
    Reshufle
}

export class GridChangesInfo {
    type: GridChangesType = GridChangesType.None
    activeTile: Tile
    removedTiles: Array<Tile>
    dropTiles: Array<Tile>
    reshafle: boolean
    booster: Tile
}

export class Grid {
    private _size: cc.Vec2 = null
    private _board: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []
    private _state = GridState.NotReady
    private _gridChanges: GridChangesInfo = new GridChangesInfo()


    private _reshufleActivate = false

    constructor() {
       this._size = Global.m.config.GridSize
       this._addTiles()
    }

    onChangeGrid = new Event

    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get board() { return this._board }
    get isBlock() { return this._state == GridState.Move || this._state == GridState.FullStop }

    removeBlock() {
        this._state = GridState.Ready
    }

    reshufleGridIfNeeded(forceReshufle = false) {
        if (!this._needReshufle() && !forceReshufle) return
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
        this.reshufleGridIfNeeded()
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
            cc.log("")
        }
    }

    private _addTiles() {
        for (let row = 0; row < this._size.x; row++) {
            this._board.push([])
            for (let column = 0; column < this._size.y; column++) {
                let tile = new Tile(cc.v2(row, column))
                tile.onAction.add(this, () => {
                    if (this.isBlock) return
                    this._state = GridState.Move
                    this._changeGrid(tile)
                })
                this._board[row].push(tile)
            }
        }
        this.reshufleGridIfNeeded()
    }

    private _needReshufle() {
        for (let row = 0; row < this._size.x; row++) {
            for (let column = 0; column < this._size.y; column++) {
                let tilePos = cc.v2(row, column)
                if (this._getListConnectedTiles(tilePos).length > 1 || this._getTile(tilePos).isBooster) {
                    return false
                }
            }
        }
        return true
    }

    private _getTile(pos: cc.Vec2) { return this._board[pos.x][pos.y] }

    private _getListConnectedTiles(pos: cc.Vec2) {
        this._connectedTilesArray = []
        let tileColor = this._getTile(pos).state
        this._findConnectedTiles(pos, tileColor)
        return this._connectedTilesArray
    }

    private _removeConnectedTiles(tile: Tile) {
        let tiles = this._getListConnectedTiles(tile.pos)
        tiles.forEach((removedTile: Tile) => this._getTile(removedTile.pos).remove())
        return tiles
    }

    private _dropTiles() {
        let r = []
        for (let i = this.rowsCount - 2; i >= 0; i--) {
            for (let j = 0; j < this.columnCount; j++) {
                let emptySpaces = this._emptySpacesBelow(i, j)
                let tile = this._getTile(cc.v2(i, j))
                if (tile.isNormal && emptySpaces > 0) {
                    r.push(tile)
                    this._swapTile(tile.pos, cc.v2(i + emptySpaces, j))
                }
            }
        }
        return r
    }

    private _fillGrid() {
        for (let i = 0; i < this.columnCount; i++) {
            if (this._board[0][i].isRemoved) {
                let emptySpaces = this._emptySpacesBelow(0, i) + 1
                for (let j = 0; j < emptySpaces; j++) {
                    this._board[j][i].updateState()
                }
            }
        }
    }

    private _findConnectedTiles(pos: cc.Vec2, color) {
        if (!this._isValidPick(pos)) return

        let tile = this._getTile(pos)
        if (tile.isRemoved) return
        
        if (tile.state == color && !this._isCheckTile(tile)) {
            this._connectedTilesArray.push(tile)
            this._findConnectedTiles(cc.v2(pos.x + 1, pos.y), color)
            this._findConnectedTiles(cc.v2(pos.x - 1, pos.y), color)
            this._findConnectedTiles(cc.v2(pos.x, pos.y + 1), color)
            this._findConnectedTiles(cc.v2(pos.x, pos.y - 1), color)
        }
    }

    private _isCheckTile = (tileCheck: Tile) => 
        this._connectedTilesArray.find(tile => { return tile.pos.x === tileCheck.pos.x && tile.pos.y === tileCheck.pos.y }) != null

    private _isValidPick = (pos: cc.Vec2) => this._board[pos.x]?.[pos.y] != null

    private _emptySpacesBelow(row: number, column: number) {
        let r = 0
        if (row != this.rowsCount) {
            for (let i = row + 1; i < this.rowsCount; i++) {
                this._getTile(cc.v2(i, column)).isRemoved && r++ 
            }
        }
        return r
    }

    private _swapTile(fromPos: cc.Vec2, toPos: cc.Vec2) {
        let setNewTile = (pos: cc.Vec2, newTile: Tile) => {
            this._board[pos.x][pos.y] = newTile
            this._board[pos.x][pos.y].updatePos(cc.v2(pos.x, pos.y))
        }
        let fromTile = Object.assign(this._getTile(fromPos))
        setNewTile(fromPos, this._getTile(toPos))
        setNewTile(toPos, fromTile)
    }

    private _createBomb(tile: Tile, tilesRemoveCount: number) {
        let getBombType = tilesRemoveCount => {
            if (tilesRemoveCount >= Global.m.config.BoosterMegaBombTilesCount) {
                return TileState.RemoveAll
            // } else if (tilesRemoveCount >= Global.m.config.BoosterReshufleTilesCount) {
            //     return TileState.Reshafle
            } else if (tilesRemoveCount >= Global.m.config.BoosterReshufleTilesCount) {
                return TileState.Reshafle
            } else {
                let boostersList = Global.m.config.SimpleBoostersList
                return boostersList[randomInteger(0, boostersList.length - 1)]
            }
        }

        tile.createBomb(getBombType(tilesRemoveCount))
    } 
    
    private _useLine(tile: Tile) {
        let r = []
        let isVertical = tile.state == TileState.Vertical
        let lineLenght = isVertical ? this._size.y : this._size.x
        for (let line = 0; line < lineLenght; line++) {
            let removeTile = isVertical ? this._board[line][tile.pos.y] : this._board[tile.pos.x][line]
            r = r.concat(this._removeWithBooster(removeTile, tile))
        } 
        return r
    }

    private _useBomb(tile: Tile) {
        let r = []
        let size = Global.m.config.BombRadius
        for (let row = tile.pos.x - size; row <= tile.pos.x + size; row++) {
            for (let column = tile.pos.y - size; column <= tile.pos.y + size; column++) {
                if (this._isValidPick(cc.v2(row, column))) {
                    r = r.concat(this._removeWithBooster(this._board[row][column], tile))
                }
            } 
        } 
        return r
    }

    private _removeWithBooster(removeTile: Tile, booster: Tile) {
        let isNewBooster = removeTile.isBooster && !booster.compare(removeTile)
        !isNewBooster && removeTile.remove()
        return isNewBooster ? this._boosterActivate(removeTile) : removeTile
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

    private _changeGrid(tile: Tile) {
        this._gridChanges.type = tile.isBooster ? GridChangesType.Booster : GridChangesType.Simple
        this._gridChanges.activeTile = tile
        
        if (tile.isBooster) {
            this._gridChanges.reshafle = tile.state == TileState.Reshafle
            this._gridChanges.removedTiles = this._boosterActivate(tile)
        } else {
            if (this._canMakeMove(tile)) return
            this._gridChanges.removedTiles = this._removeConnectedTiles(tile)
            if (this._gridChanges.removedTiles.length >= Math.min(...Global.m.config.ListBoosterTilesCount)) {
                this._createBomb(tile,  this._gridChanges.removedTiles.length)
            }
        }
        this._gridChanges.dropTiles = this._dropTiles()
        this._fillGrid()
        if (this._needReshufle() || this._reshufleActivate)  this._gridChanges.reshafle = true

        this.onChangeGrid.dispatch(this._gridChanges)
        this._gridChanges = new GridChangesInfo()
    }

    private _canMakeMove(tile: Tile) {
        let tiles = this._getListConnectedTiles(tile.pos)
        let canMakeMove = tiles.length <= 1
        if (canMakeMove) {
            tile.onNoCombo.dispatch()
            this._state = GridState.Ready
        }
        return canMakeMove
    }

    private _boosterActivate(tile: Tile) {
        let removedTiles = []
        switch(tile.state) {
            case TileState.Bomb:      removedTiles = this._useBomb(tile); break
            case TileState.RemoveAll: removedTiles = this._useSuperBomb(); break
            case TileState.Reshafle:  
                tile.remove()
                this._gridChanges.reshafle = true
                removedTiles = [tile]
                break
            case TileState.Horizontal:
            case TileState.Vertical:
                removedTiles = this._useLine(tile); break
        }
        return removedTiles
    }
} 