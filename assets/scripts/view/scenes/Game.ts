import GridNode from "../nodes/GridNode";
import ConditionalNode from "../nodes/ConditionalNode";
import InventoryBoostersNode from "../nodes/InventoryBoostersNode";
import { Grid, GridChangesInfo } from "../../model/Grid";
import { Conditional, EndType } from "../../model/Conditional";
import { InventoryBoosters } from "../../model/InventoryBoosters";
import { Tile, TileState } from "../../model/Tile";
import EndNode from "../nodes/EndNode";
import BoosterNode from "../nodes/BoosterNode";
import Global from "../../Global";
import { SceneType } from "./SceneType";

const { ccclass, property } = cc._decorator;
@ccclass
export class Game extends cc.Component {
    @property(GridNode) gridView: GridNode = null
    @property(ConditionalNode) conditionalView: ConditionalNode = null
    @property(InventoryBoostersNode) inventoryBoosterView: InventoryBoostersNode = null
    @property(cc.Node) blackScreen: cc.Node = null
    @property(cc.Node) chooseBoosterScreen: cc.Node = null
    @property(cc.Prefab) endPrefab: cc.Prefab = null

    private _grid: Grid
    private _conditional: Conditional
    private _inventoryBoosters: InventoryBoosters

    onLoad() {
        this.blackScreen.active = true
        this.chooseBoosterScreen.active = false
        this.newGame().then(() => {
            cc.tween(this.blackScreen)
                .to(Global.config.transitionBetweenScenesTime, { opacity: 0 })
                .call(() => this.blackScreen.active = false)
                .start()
        })
    }

    newGame = () => new Promise(r => {
        this._grid = new Grid()
        this._conditional = new Conditional()
        this._inventoryBoosters = new InventoryBoosters()

        this._subscrubeModelEvent()
        this._initView()
        this._subscrubeViewEvent()

        r()
    })

    onExitSelectBooster()  {
        this.chooseBoosterScreen.active = false
        this.inventoryBoosterView.disableBooster()
        this._grid.removeBlock()
    }

    private _reshuffleGrid() {
        const forceReshuffle = true
        this._grid.reshuffleGridIfNeeded(forceReshuffle)
        this.gridView.reshuffleChange()
    }

    private _subscrubeModelEvent() {
        this._grid.onChangeGrid.add(this.node, (changes: GridChangesInfo) => {
            let removeTileCount = changes.removedTiles ? changes.removedTiles.length : 0
            this._conditional.changeConditional(removeTileCount)
        })
        this._grid.onNoMoves.add(this.node, () => {
            this._conditional.decrementReshuffleCount()
        })
        this._grid.onAddBooster.add(this.node, (tile: Tile) => {
            this._inventoryBoosters.decremenBoosterCount(tile.state)
        })
        this._conditional.onEnd.add(this.node, (endType: EndType) => {
            let endNode = cc.instantiate(this.endPrefab)
            endNode.getComponent(EndNode).setEndType(endType)
            endNode.getComponent(EndNode).onExit.replace(this.node, () => {
                let animEndNode = cc.tween(endNode)
                    .by(0.1, { scale: 0.1 })
                    .to(0.2, { scale: 0 })
                    .start()
                let animBlackScreen = cc.tween(this.blackScreen)
                    .to(Global.config.transitionBetweenScenesTime, { opacity: 255 })
                    .call(() => cc.director.loadScene(SceneType.Menu))
                    .start()
                cc.tween(this.blackScreen).sequence(
                    animEndNode,
                    cc.tween(this.blackScreen).delay(0.2),
                    animBlackScreen
                )
            })

            this.blackScreen.active = true
            this.blackScreen.opacity = 200
            this.blackScreen.addChild(endNode)
        })
    }

    private _initView() {
        this.gridView.createGrid(this._grid).then(() => {
            // needReshuffl маленький хак чтобы решафл происходил после стабилизации вьюшного поля
            // TODO вынести reshuffle в модель
            this.gridView.onAnimationCompleted.add(this.node, needReshuffle => {
                this.chooseBoosterScreen.active = this._grid.isSelectBooster
                if (!this._grid.isSelectBooster) this.inventoryBoosterView.disableBooster()
                if (needReshuffle) this._reshuffleGrid()
                else if (this._grid.isSelectBooster) return
                else this._grid.removeBlock()
            })
        })
        this.conditionalView.setConditional(this._conditional)
        this.inventoryBoosterView.setInventory(this._inventoryBoosters)
    }

    private _subscrubeViewEvent() {
        this.inventoryBoosterView.boosters.children.forEach(b => {
            b.getComponent(BoosterNode).onActivateBooster.replace(this.node, (t: TileState) =>  {
                this.chooseBoosterScreen.active = true
                this._grid.waitTileSelectionBooster(t)
                this.inventoryBoosterView.selectBooster(t)
            })
        })
    }
}