import { Tile } from "../../model/Tile";
import Global from "../../Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileNode extends cc.Component {
    @property(cc.Sprite) tileIcon: cc.Sprite = null
    // TODO add loader
    @property([cc.SpriteFrame]) icons = new Array<cc.SpriteFrame>()

    private _tile: Tile
    private _tileSize: number
    private _animationSpeed = 1

    get tile() { return this._tile }

    setTileInfo(t: Tile) {
        this._tile = t
    }

    onLoad() {
        if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1]
        this._tile.onNoCombo.add(this.node, () => this.noComboAnimation())
        this._updateZindex()
        this._tileSize = this.node.getContentSize().width
        this._animationSpeed = Global.m.config.SpeedAnimation
    }

    onClick() {
        this._tile.action()
    }

    noComboAnimation() {
        const rotation = 30
        const rotationTime = 0.08 * this._animationSpeed
        let rotate = cc.tween()
            .to(rotationTime, { rotation: rotation })
            .to(rotationTime, { rotation: -rotation })
        
        let zIndex = +("" + Global.m.config.GridSize.x + Global.m.config.GridSize.y + 1)
        cc.tween(this.node)
            .call(() => this.node.zIndex = zIndex)
            .then(rotate)
            .repeat(2)
            .to(rotationTime, { rotation: 0 })
            .call(() => this._updateZindex())
            .start()
    }

    removeAnimation = () => new Promise(r => {
        const scaleTime1 = 0.08 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .by(scaleTime1 * this._animationSpeed, { scale: 0.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 0 })
        cc.tween(this.node)
            .then(scale) 
            .call(() => { this.node.opacity = 0; this.node.scale = 1 })
            .call(r)
            .start()
    })

    dropAnimation = () => new Promise(r => {
        let distance = this.tile.pos.x + this.node.position.y / this._tileSize
        const baseSpeed = 0.2

        let endPos = cc.v3(this.tile.pos.y * this._tileSize, -this.tile.pos.x * this._tileSize)
        const baseDelay = 0.018
        const currentDelay = baseDelay * (Global.m.config.GridSize.y - this.tile.pos.x + 1)

        cc.tween(this.node)
            .delay(currentDelay * this._animationSpeed)
            .to(baseSpeed * distance * this._animationSpeed, { position: endPos }, { easing: 'quadIn' })
            .call(() => this._updateZindex())
            .call(r)
            .start()
    })

    updateRemoveTileAnimation = () => new Promise(r => {
        if (this._tile.isBooster) return r()
        const scaleTime1 = 0.2 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .to(scaleTime1 * this._animationSpeed, { scale: 1.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 1 })
        let endPos = cc.v3(this.tile.pos.y * this._tileSize, -this.tile.pos.x * this._tileSize)
        cc.tween(this.node)
            .call(() => {
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
                this.node.scale = 0
                this.node.position = endPos
                this.node.opacity = 255
                this._updateZindex()
            })
            .then(scale)
            .call(r)
            .start()
    })

    createBombAnimation = () => new Promise(r => {
        const scaleTime1 = 0.2 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .to(scaleTime1 * this._animationSpeed, { scale: 1.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 1 })
        cc.tween(this.node)
            .call(() => {
                if (this._tile.isNormal) this.tileIcon.spriteFrame = this.icons[this._tile.state - 1] 
                this.node.scale = 0
                this.node.opacity = 255
                this._updateZindex()
            })
            .then(scale)
            .call(r)
            .start()
    }) 

    reshufleAnimation() {
        let endPos = cc.v3(this.tile.pos.y * this._tileSize, -this.tile.pos.x * this._tileSize)

        const scaleTime1 = 0.08 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .by(scaleTime1 * this._animationSpeed, { scale: 0.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 0 })

        cc.tween(this.node)
            .then(scale)
            .call(() => this.node.position = endPos)
            // .to(0.4 * this.tile.pos.y, { position: endPos })
            .call(() => this._updateZindex())
            // .by(scaleTime1 * this._animationSpeed, { scale: 1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 1 })
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
