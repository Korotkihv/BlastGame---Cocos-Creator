import { Grid, GridChangesInfo } from "./Grid"
import Global from "../Global"
import { Conditional } from "./Conditional"
import GridNode from "../view/nodes/GridNode";
import ConditionalNode from "../view/nodes/ConditionalNode";

const { ccclass, property } = cc._decorator;
@ccclass
export class GameController extends cc.Component {
    @property(GridNode) gridView: GridNode = null
    @property(ConditionalNode) conditionalView: ConditionalNode = null

    private _grid: Grid
    private _conditional: Conditional

    onLoad() {
        this.newGame()
    }

    newGame() {
        this._grid = new Grid()
        this._conditional = new Conditional()

        this._grid.onChangeGrid.add(this.node, (changes: GridChangesInfo) => {
            let removeTileCount = changes.removedTiles ? changes.removedTiles.length : 0
            this._conditional.onChangeConditional(removeTileCount)
        })

        this.gridView.createGrid(this._grid).then(() => {
            // needReshufl маленький хак чтобы решафл происходил после стабилизации вьюшного поля
            // TODO вынести reshufle в модель
            this.gridView.onAnimationCompleted.add(this.node, needReshufle => {
                if (needReshufle) this.reshufleGrid()
                else this._grid.removeBlock()
            })
        })
        this.conditionalView.setConditional(this._conditional)
    }

    reshufleGrid() {
        const forceReshufle = true
        this._grid.reshufleGridIfNeeded(forceReshufle)
        this.gridView.reshufleChange()
    }
}