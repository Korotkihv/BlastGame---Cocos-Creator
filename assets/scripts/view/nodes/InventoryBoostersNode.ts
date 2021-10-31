import { Conditional, EndType } from "../../model/Conditional";
import { SceneType } from "../scenes/SceneType";
import { Booster, InventoryBoosters } from "../../model/InventoryBoosters";
import { Event } from "../../utils/Event";
import BoosterNode from "./BoosterNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class InventoryBoostersNode extends cc.Component {
    @property(cc.Node) boosters: cc.Node = null

    setInventory(inventory: InventoryBoosters) {
        this.boosters.children.forEach((bn, i) => {
            bn.getComponent(BoosterNode).setBooster(inventory.boosters[i])
        })
    }
}
