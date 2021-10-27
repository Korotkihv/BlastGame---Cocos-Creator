import { Grid, GridChangesInfo, GridChangesType } from "../model/Grid";
import TileNode from "./TileNode";
import { Tile } from "../model/Tile";
import Global from "../Global";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GridNode extends cc.Component {
    @property(cc.Prefab) tilePrefab: cc.Prefab = null

    private _grid: Grid = null
    private _tileSize = 0

    getTileNode(tile: Tile) {
        return this.node.children.find((node: cc.Node) => {
            let tileNode = node.getComponent(TileNode)
            return tileNode.tile.pos.x == tile.pos.x && tileNode.tile.pos.y == tile.pos.y
        }).getComponent(TileNode)
    }

    onLoad() {
        Global.m = new Global()
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this.createGrid(Global.m.config.GridSize)
    }
    
    createGrid(size: cc.Vec2) {
        let grid = new Grid(size)
        grid.onAddTile.add(this.node, (tile: Tile) => this.createTile(tile))
        grid.onChangeGrid.add(this.node, (changesInfo: GridChangesInfo) => this.changeGrid(changesInfo))
        this._grid = grid
        grid.addTiles()
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setTileInfo(tile)
        tileNode.setPosition(tile.pos.y * this._tileSize, -tile.pos.x * this._tileSize)
        this.node.addChild(tileNode)
    }

    changeGrid(changesInfo: GridChangesInfo) {
        if (changesInfo.type == GridChangesType.Simple) {
            this.simpleChange(changesInfo)
        } else {
            this.boosterChange(changesInfo)
        }
    }

    simpleChange(changesInfo: GridChangesInfo) {
        cc.tween(this.node)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).removeAnimation()))            
            .call(() => changesInfo.activeTile.isBooster && this.getTileNode(changesInfo.activeTile).createBombAnimation())
            .call(() => changesInfo.dropTiles.forEach(t => this.getTileNode(t).dropAnimation()))
            .delay(1.2)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).updateRemoveTileAnimation()))
            .start()
    }

    boosterChange(changesInfo: GridChangesInfo) {
        cc.tween(this.node)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).removeAnimation()))
            .call(() => changesInfo.dropTiles.forEach(t => this.getTileNode(t).dropAnimation()))
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).updateRemoveTileAnimation()))
            .start()
    }
}
