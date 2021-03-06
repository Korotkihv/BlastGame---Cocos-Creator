import { Tile, TileState } from "./Tile"
import { Event } from "../utils/Event"
import { shuffle, chunkArray, randomInteger } from "../utils/Utils"
import Global from "../Global"


export const enum GridState {
    NotReady = 0,
    Ready,
    Move,
    FullStop,
    SelectBooster
}

export const enum GridChangesType {
    None,
    Simple,
    Booster,
    Reshuffle
}

export class GridChangesInfo {
    type: GridChangesType = GridChangesType.None
    activeTile: Tile
    removedTiles: Array<Tile>
    dropTiles: Array<Tile>
    reshuffle: boolean
    booster: Tile
}

export class Grid {
    private _size: cc.Vec2 = null
    private _board: Array<Array<Tile>> = []
    private _connectedTilesArray: Array<Tile> = []
    private _state = GridState.NotReady
    private _gridChanges: GridChangesInfo = new GridChangesInfo()
    private _waitSelectBoosterType: TileState = null


    private _reshuffleActivate = false

    constructor() {
       this._size = Global.config.gridSize
       this._addTiles()
    }

    onChangeGrid = new Event
    onNoMoves = new Event
    onAddBooster = new Event

    get rowsCount() { return this._size.x }
    get columnCount() { return this._size.y }
    get board() { return this._board }
    get listTiles() {
        // return this._board.reduce((p, n) => p.concat(n) ,[])

        let allTiles = []
        this._board.forEach(r => allTiles = allTiles.concat(r))
        return allTiles
    }
    get isBlock() { return this._state == GridState.Move || this._state == GridState.FullStop }
    get isSelectBooster() { return this._state == GridState.SelectBooster }

    removeBlock() {
        this._state = GridState.Ready
    }

    reshuffleGridIfNeeded(forceReshuffle = false) {
        if (!this._needReshuffle() && !forceReshuffle) return
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
        this.reshuffleGridIfNeeded()
    }

    waitTileSelectionBooster(type) {
        this._state = GridState.SelectBooster
        this._waitSelectBoosterType = type
    }

    isValidPick = (pos: cc.Vec2) => this._board[pos.x]?.[pos.y] != null

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
                    if (this.isSelectBooster) {
                        this._state = GridState.Move
                        this._selectBooster(tile)
                        return
                    }
                    this._state = GridState.Move
                    this._changeGrid(tile)
                })
                this._board[row].push(tile)
            }
        }
        this.reshuffleGridIfNeeded()
    }

    private _needReshuffle() {
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

    // ?????????????? ?? gridRemover
    private _removeTiles(tile: Tile) {
        let r = []
        let tiles = this._getListConnectedTiles(tile.pos)
        tiles.forEach((removedTile: Tile) => {
            r = r.concat(this._getTile(removedTile.pos).getRemoveStrategy.getRemoveTiles(removedTile, this))
        })
        return r
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
        if (!this.isValidPick(pos)) return

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
        let boosterList = Global.config.listBoosterTilesCount
        if (tilesRemoveCount < Math.min(...boosterList)) return

        let getBombType = tilesRemoveCount => {
            if (tilesRemoveCount >= Global.config.boosterMegaBombTilesCount) {
                return TileState.RemoveAll
            } else if (tilesRemoveCount >= Global.config.boosterReshuffleTilesCount) {
                return TileState.Reshuffle
            } else {
                let boostersList = Global.config.simpleBoostersList
                return boostersList[randomInteger(0, boostersList.length - 1)]
            }
        }

        tile.createBomb(getBombType(tilesRemoveCount))
    } 

    private _changeGrid(tile: Tile) {
        if (tile.isBooster || this._canMakeMove(tile)) {
            let changeType = tile.isBooster ? GridChangesType.Booster : GridChangesType.Simple

            this._gridChanges.type = changeType
            this._gridChanges.activeTile = tile
            this._gridChanges.removedTiles = this._removeTiles(tile)

            let canMakeBooster = changeType != GridChangesType.Booster
            canMakeBooster && this._createBomb(tile, this._gridChanges.removedTiles.length)

            this._gridChanges.dropTiles = this._dropTiles()
            this._fillGrid()
            
            let needReshuffle = this._needReshuffle()
            if (needReshuffle || this._reshuffleActivate) {
                needReshuffle && this.onNoMoves.dispatch()
                this._gridChanges.reshuffle = true
            }

            this.onChangeGrid.dispatch(this._gridChanges)
            this._gridChanges = new GridChangesInfo()
        }
    }

    private _canMakeMove(tile: Tile) {
        let tiles = this._getListConnectedTiles(tile.pos)
        let canMakeMove = tiles.length > 1
        if (!canMakeMove) {
            tile.onNoCombo.dispatch()
            this._state = GridState.Ready
        }
        return canMakeMove
    }

    private _selectBooster(tile: Tile) {
        this._getTile(tile.pos).state = this._waitSelectBoosterType
        this._state = GridState.Ready
        this._waitSelectBoosterType = null
        this.onAddBooster.dispatch(tile)
    }
} 