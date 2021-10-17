import { TileColor, Tile } from "../model/Tile";
import { Event } from "../utils/Event"

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    _tile: Tile
    onClickEvent = new Event

    setTileInfo(t: Tile) {
        this._tile = t
    }

    onLoad() {
        this.tileIcon.spriteFrame = this.icons[this._tile.color]
    }

    onClick() {
        cc.log("1")
        this._tile.activate()
    }

    noComboAction() {

    }

    destroyAction() {
        this.node.opacity = 0
    }

    dropTile() {

    }

    

    // setPositionAction(position, time: Number = null, showIn = false) {
    //     return new Promise((resolve) => {
    //         if (time == null) time = this.durationMoveTo;
    //         if (showIn) {
    //             this.node.opacity = 99;
    //             this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
    //         }

    //         this.node.runAction(
    //             cc.sequence(
    //                 cc
    //                     .moveTo(this.durationActionRemove, position)
    //                     .easing(cc.easeBackInOut()),
    //                 cc.callFunc(() => {
    //                     resolve();
    //                 })
    //             )
    //         );
    //     });
    // }

    // setPositionActionRemove(position = null, showIn = false) {
    //     position = position || this.node.position;
    //     return new Promise((resolve) => {
    //         if (showIn) {
    //             this.node.opacity = 99;
    //             this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
    //         }

    //         cc.tween(this.node)
    //             .to(
    //                 this.durationMoveTo,
    //                 { position: position, scale: 0 },
    //                 { easing: "backIn" }
    //             )
    //             .call(() => {
    //                 this.node.destroy();
    //                 resolve(this.node);
    //             })
    //             .start();
    //     });
    // }

    // noComboAnimation() {
    //     let rotate = cc
    //         .tween()
    //         .to(0.08, { rotation: 30 })
    //         .to(0.08, { rotation: -30 });

    //     cc.tween(this.node)
    //         .then(rotate)
    //         .repeat(2)
    //         .to(0.08, { rotation: 0 })
    //         .start();
    // }
}
