import { Grid, GridChangesInfo, GridChangesType } from "../../model/Grid";
import TileNode from "./TileNode";
import { Tile } from "../../model/Tile";
import Global from "../../Global";
import { Event } from "../../utils/Event";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GridNode extends cc.Component {
    @property(cc.Prefab) tilePrefab: cc.Prefab = null
    @property(cc.Node) tiles: cc.Node = null

    onAnimationCompleted = new Event

    private _grid: Grid = null
    private _tileSize = 0

    getTileNode(tile: Tile) {
        return this.tiles.children.find((node: cc.Node) => {
            let tileNode = node.getComponent(TileNode)
            return tileNode.tile.pos.x == tile.pos.x && tileNode.tile.pos.y == tile.pos.y
        }).getComponent(TileNode)
    }
    
    async createGrid(grid: Grid) {
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this._grid = grid
        this._grid.board.forEach(r => r.forEach(t => this.createTile(t)))
        this._grid.onChangeGrid.add(this.node, (changesInfo: GridChangesInfo) => this.changeGrid(changesInfo))
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setTileInfo(tile)
        tileNode.setPosition(tile.pos.y * this._tileSize, -tile.pos.x * this._tileSize)
        this.tiles.addChild(tileNode)
    }

    changeGrid(changesInfo: GridChangesInfo) {
        if (changesInfo.reshafle) {
            this.reshufleChange(changesInfo)
        } else {
            if (changesInfo.type == GridChangesType.Simple) {
                this.simpleChange(changesInfo)
            } else if (changesInfo.type == GridChangesType.Reshufle) {
                this.reshufleChange(changesInfo)
            } else {
                this.boosterChange(changesInfo)
            }
        }
    }

    async simpleChange(changesInfo: GridChangesInfo) {
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).removeAnimation()))
        changesInfo.activeTile.isBooster && await this.getTileNode(changesInfo.activeTile).createBombAnimation()
        await Promise.all(changesInfo.dropTiles.map(t => this.getTileNode(t).dropAnimation()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).updateRemoveTileAnimation()))
        await this.onAnimationCompleted.dispatch()
    }

    async boosterChange(changesInfo: GridChangesInfo) {
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).removeAnimation()))
        await Promise.all(changesInfo.dropTiles.map(t => this.getTileNode(t).dropAnimation()))
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).updateRemoveTileAnimation()))
        await this.onAnimationCompleted.dispatch()
    }

    async reshufleChange(changesInfo: GridChangesInfo) {
        await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).removeAnimation()))
        await Promise.all(this.tiles.children.map(t => t.getComponent(TileNode).reshufleAnimation()))
        // await Promise.all(changesInfo.dropTiles.map(t => this.getTileNode(t).dropAnimation()))
        // await Promise.all(changesInfo.removedTiles.map(t => this.getTileNode(t).updateRemoveTileAnimation()))
        // await Promise.all(new Promise(r => { cc.tween(this.node).delay(2).call(r).start}))
        await this.onAnimationCompleted.dispatch()
    }
}
