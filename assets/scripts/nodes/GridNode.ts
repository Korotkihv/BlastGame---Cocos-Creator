import { Grid } from "../model/Grid";
import TileNode from "./TileNode";
import { Tile } from "../model/Tile";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GridNode extends cc.Component {
    @property(cc.Prefab) tilePrefab: cc.Prefab = null

    private _grid: Grid = null
    private _tileSize = 0

    onLoad() {
        this._tileSize = this.tilePrefab.data.getContentSize().width
        this.createGrid()
    }
    
    createGrid() {
        let grid = new Grid(new cc.Vec2(11, 11))
        grid.addTiles()
        grid.logBoard()
        grid.onChangeGrid.add(this.node, (list: Array<Tile>) => this.changeGrid(list))
        let maxZ = 11 * 11
        grid.board.forEach((row) => {
            row.forEach(tile => {
                let tileNode = cc.instantiate(this.tilePrefab)
                tileNode.getComponent(TileNode).setTileInfo(tile)
                tileNode.setPosition(tile.pos.x * 41, -tile.pos.y * 41)
                this.node.addChild(tileNode, maxZ)
                maxZ--

            })
        })
    }

    changeGrid(list: Array<Tile>) {
        cc.log("LOL", list)
        list.forEach((t: Tile) => {
            let ne = this.node.children.find((n) => {
                return t.pos.x == n.getComponent(TileNode)._tile.pos.x &&
                t.pos.y == n.getComponent(TileNode)._tile.pos.y
            })
            cc.log("4")
            cc.log(ne)
            ne && ne.getComponent(TileNode).destroyAction()
        })
    }
}
