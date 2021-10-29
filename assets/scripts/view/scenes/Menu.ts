import Global from "../../Global";
import { SceneType } from "./SceneType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    onLoad() {
        
    }

    onNewGame() {
        cc.director.loadScene(SceneType.Game)
    }
}
