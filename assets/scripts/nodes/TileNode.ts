import { Tile } from "../model/Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _tile: Tile

    get tile() { return this._tile }

    setTileInfo(t: Tile) {
        this._tile = t
    }

    onLoad() {
        if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1]
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
        if (this._tile.isBooster) return
        // cc.tween(this.node)
        //     .call(() => this.node.opacity = 0)
        //     .start()
        cc.tween(this.node)
            .to(0.1, { scale: 1.1 })
            .to(0.15, { scale: 0 })
            .call(() => this.node.opacity = 0)
            .to(1, { scale: 1 })
            .start()
            
    }

    move() {
        cc.tween(this.node)
                .to(0.4, { position: cc.v3(this.tile.pos.y * 43, -this.tile.pos.x * 43) }, { easing: 'cobicOut'})
                .call(() => {
                    this._updateZindex()
                })
                .start()
    }

    moveRemoveTiles() {
        if (this._tile.isBooster) return
        cc.tween(this.node)
            .call(() => {
                this.node.scale = 0
                this.node.opacity = 255
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
                this.node.setPosition(cc.v2(this.tile.pos.y * 43, -this.tile.pos.x * 43))
                this._updateZindex()
            })
            .parallel(
                cc.tween(this.node).to(0.5, { rotation: 360 }),
                cc.tween(this.node).to(0.5, { scale: 1 })
            )
            .start()
    }

    moveNewPos() {
        cc.tween(this.node).parallel(
            cc.tween(this.node)
                .to(0.6, { position: cc.v3(this._tile.pos.y * 43, -this._tile.pos.x * 43) }),
            cc.tween(this.node)
                .to(0.3, { scale: 1.2 })  
                .to(0.3, { scale: 1 })  
            
        )
        .call(() => {
            this._updateZindex()
        })
        .start()
    }

    refresh() {
        cc.tween(this.node)
            .call(() => {
                this.node.scale = 0
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
            })
            .parallel(
                cc.tween(this.node).to(0.5, { rotation: 720 }),
                cc.tween(this.node).to(0.5, { scale: 1 })
            )
            .start()
    }

    private _updateZindex() {
        this.node.zIndex = -("" + this._tile.pos.x + this._tile.pos.y)
    }
}
