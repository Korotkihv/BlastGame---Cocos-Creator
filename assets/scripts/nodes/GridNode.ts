import { Grid, GridChangesInfo, GridChangesType } from "../model/Grid";
import TileNode from "./TileNode";
import { Tile } from "../model/Tile";

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
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this.createGrid(11, 11)
    }
    
    createGrid(w, h) {
        let grid = new Grid(new cc.Vec2(w, h))
        grid.onAddTile.add(this.node, (tile: Tile) => this.createTile(tile))
        grid.onChangeGrid.add(this.node, (changesInfo: GridChangesInfo) => this.changeGrid(changesInfo))
        this._grid = grid
        grid.addTiles()
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setTileInfo(tile)
        tileNode.setPosition(tile.pos.y * 43, -tile.pos.x * 43)
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
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).destroyAction()))
            .call(() => changesInfo.booster && this.getTileNode(changesInfo.booster).refresh())
            .call(() => changesInfo.dropTiles.forEach(t => this.getTileNode(t).move()))
            .delay(0.6)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).moveRemoveTiles()))
            .start()
    }

    boosterChange(changesInfo: GridChangesInfo) {
        cc.tween(this.node)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).destroyAction()))
            .delay(0.1)
            .call(() => changesInfo.dropTiles.forEach(t => this.getTileNode(t).move()))
            .delay(0.6)
            .call(() => changesInfo.removedTiles.forEach(t => this.getTileNode(t).moveRemoveTiles()))
            .start()
    }
}
