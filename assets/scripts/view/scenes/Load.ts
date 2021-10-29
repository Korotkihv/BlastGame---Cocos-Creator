import Global from "../../Global";
import { SceneType } from "./SceneType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Load extends cc.Component {
    @property(cc.Node) blackScreen: cc.Node = null

    start() {
        this.init()
    }
    init() {
        Global.m = new Global()
        cc.director.preloadScene(SceneType.Menu)
        setTimeout(() => {
            cc.director.loadScene(SceneType.Menu)
        }, 1500)
    }
}
