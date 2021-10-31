import { Conditional, EndType } from "../../model/Conditional";
import { SceneType } from "../scenes/SceneType";
import { Booster } from "../../model/InventoryBoosters";
import { Event } from "../../utils/Event";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BoosterNode extends cc.Component {
    @property(cc.Label) count: cc.Label = null
    @property(cc.Sprite) boosterIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _booster: Booster

    onActivateBooster = new Event

    setBooster(booster: Booster) {
        this._booster = booster
        this.boosterIcon.spriteFrame = this.icons[booster.type - 1]
        this.count.string = `${booster.count}`
        booster.onChangeCount.add(this.node, () => {
            this._changeCount()
        })
    }

    addBoosterButton() {
        if (this._booster.count <= 0) return
        this.onActivateBooster.dispatch(this._booster.type)
    }

    private _changeCount() {
        this.count.string = `${this._booster.count}`
    }
}
