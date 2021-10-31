import Global from "../../Global";
import { SceneType } from "./SceneType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Load extends cc.Component {
    @property(cc.Node) blackScreen: cc.Node = null

    start() {
        this._init().then(() => {
            cc.director.loadScene(SceneType.Menu)
        })
    }
    private _init() {
        return new Promise(r => {
            Global.m = new Global()
            cc.director.preloadScene(SceneType.Menu)
            setTimeout(() => {
                cc.tween(this.blackScreen)
                    .to(Global.m.config.transitionBetweenScenesTime, { opacity: 255 })
                    .call(r)
                    .start()
            }, 1000)
        })
    }
}
