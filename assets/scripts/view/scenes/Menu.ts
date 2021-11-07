import { SceneType } from "./SceneType";
import Global from "../../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    @property(cc.Node) blackScreen: cc.Node = null

    start() {
        this.blackScreen.active = true
        cc.tween(this.blackScreen)
            .delay(0.3)
            .to(Global.config.transitionBetweenScenesTime, { opacity: 0 })
            .call(() => this.blackScreen.active = false)
            .start()
    }

    onNewGameButton() {
        cc.tween(this.blackScreen)
            .call(() => this.blackScreen.active = true)
            .to(Global.config.transitionBetweenScenesTime, { opacity: 255 })
            .call(() => cc.director.loadScene(SceneType.Game))
            .start()
    }
}
