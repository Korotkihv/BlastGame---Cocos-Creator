import { Grid } from "../model/Grid";
import TileNode from "./TileNode";
import { Tile } from "../model/Tile";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GridNode extends cc.Component {
    @property(cc.Prefab) tilePrefab: cc.Prefab = null

    private _grid: Grid = null
    private _tileSize = 0
    private _maxZIndexTile = 0

    onLoad() {
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this.createGrid(11, 11)
    }
    
    createGrid(w, h) {
        let grid = new Grid(new cc.Vec2(w, h))
        grid.onAddTile.add(this.node, (tile: Tile) => this.createTile(tile))
        this._grid = grid
        grid.addTiles()
    }

    createTile(tile: Tile) {
        let tileNode = cc.instantiate(this.tilePrefab)
        tileNode.getComponent(TileNode).setTileInfo(tile)
        tileNode.setPosition(tile.pos.y * 41, -tile.pos.x * 41)
        this.node.addChild(tileNode)
    }
}
