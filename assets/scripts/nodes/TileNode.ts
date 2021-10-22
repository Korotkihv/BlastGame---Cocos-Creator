import { Tile } from "../model/Tile";
import AnimationController from "../utils/AnimationController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _tile: Tile

    setTileInfo(t: Tile) {
        this._tile = t
    }

    onLoad() {
        if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1]
        this._tile.onRemove.add(this.node, (tile: Tile) => this.destroyAction())
        this._tile.onUpdatePosition.add(this.node, (pos) => this.move(pos))
        this._tile.onUpdate.add(this.node, (tile: Tile) => this.refresh(tile))
        this._tile.onNoCombo.add(this.node, () => this.noComboAction())
        this._updateZindex()
    }

    onClick() {
        this._tile.action()
    }

    noComboAction() {
        let rotate = cc.tween()
            .to(0.08, { rotation: 30 })
            .to(0.08, { rotation: -30 })

        cc.tween(this.node)
            .then(rotate)
            .repeat(2)
            .to(0.08, { rotation: 0 })
            .start()
    }

    destroyAction() {
        this.node.opacity = 0
    }

    move(pos) {
        if (this._tile.isNormal) {
            cc.tween(this.node)
            .to(
                0.6,
                { position: cc.v3(pos.y * 41, -pos.x * 41) }
            )
            .start()
        } else {
            this.node.setPosition(cc.v3(pos.y * 41, -pos.x * 41))
        }
    }

    refresh(tile) {
        setTimeout(() => {
            this.node.opacity = 255
            if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1]    
        }, 700);
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
