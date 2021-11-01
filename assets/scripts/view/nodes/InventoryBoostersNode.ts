import { Conditional, EndType } from "../../model/Conditional";
import { SceneType } from "../scenes/SceneType";
import { Booster, InventoryBoosters } from "../../model/InventoryBoosters";
import { Event } from "../../utils/Event";
import BoosterNode from "./BoosterNode";
import { TileState } from "../../model/Tile";

const { ccclass, property } = cc._decorator;
@ccclass
export default class InventoryBoostersNode extends cc.Component {
    @property(cc.Node) boosters: cc.Node = null

    setInventory(inventory: InventoryBoosters) {
        this.boosters.children.forEach((bn, i) => {
            bn.getComponent(BoosterNode).setBooster(inventory.boosters[i])
        })
    }

    selectBooster(t: TileState) {
        let a = this.boosters.children.find(bn => {
            return bn.getComponent(BoosterNode).type == t
        })
        this.boosters.children.forEach(bn => bn.scale = 1)
        a.scale = 1.1
    }
    disableBooster() {
        this.boosters.children.forEach(bn => bn.scale = 1)
    }
}
