import { Tile } from "../model/Tile";
import Global from "../Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    // TODO add loader
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _tile: Tile
    private _tileSize: number

    get tile() { return this._tile }

    setTileInfo(t: Tile) {
        this._tile = t
    }

    onLoad() {
        if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1]
        this._tile.onNoCombo.add(this.node, () => this.noComboAnimation())
        this._updateZindex()
        this._tileSize = this.node.getContentSize().width
    }

    onClick() {
        this._tile.action()
    }

    noComboAnimation() {
        const rotation = 30
        const rotationTime = 0.08
        let rotate = cc.tween()
            .to(rotationTime, { rotation: rotation })
            .to(rotationTime, { rotation: -rotation })

        cc.tween(this.node)
            .then(rotate)
            .repeat(2)
            .to(rotationTime, { rotation: 0 })
            .start()
    }

    removeAnimation() {
        if (this._tile.isBooster) return
        cc.tween(this.node)
            .call(() => this._hideTile())
            .start()
            
    }

    createBombAnimation() {
        const animTime = 0.3
        cc.tween(this.node)
            .call(() => {
                this.node.scale = 0
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
            })
            .parallel(
                cc.tween(this.node).to(animTime, { rotation: 720 }),
                cc.tween(this.node).to(animTime, { scale: 1 })
            )
            .start()
    }

    dropAnimation() {
        let distance = (this.tile.pos.x + this.node.position.y / this._tileSize)
        let endPos = cc.v3(this.tile.pos.y * this._tileSize, -this.tile.pos.x * this._tileSize)
        const baseDelay = 0.018
        const currentDelay = baseDelay * (Global.m.config.GridSize.y - this.tile.pos.x + 1)
        const baseSpeed = 0.2

        cc.tween(this.node)
            .delay(currentDelay)
            .to(baseSpeed * distance, { position: endPos }, { easing: 'quadIn' })
            .call(() => this._updateZindex())
            .start()
    }

    updateRemoveTileAnimation() {
        if (this._tile.isBooster) return

        let endPos = cc.v2(this.tile.pos.y * this._tileSize, -this.tile.pos.x * this._tileSize)
        cc.tween(this.node)
            .call(() => {
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
                this.node.setPosition(endPos)
                this._updateZindex()
            })
            .call(() => this._showTile())
            .start()
    }


    private _updateZindex() {
        this.node.zIndex = -("" + this._tile.pos.x + this._tile.pos.y)
    }

    private _hideTile() {
        this.node.opacity = 0
    }

    private _showTile() {
        this.node.opacity = 255
    }
}
