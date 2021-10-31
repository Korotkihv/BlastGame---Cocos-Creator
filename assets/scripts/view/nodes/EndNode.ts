import { EndType } from "../../model/Conditional";
import { SceneType } from "../scenes/SceneType";
import { Event } from "../../utils/Event";

const { ccclass, property } = cc._decorator;
@ccclass
export default class EndNode extends cc.Component {
    @property(cc.Label) text: cc.Label = null

    onExit = new Event

    setEndType(endType: EndType) {
        this.text.string = endType == EndType.Lose ? "Проиграл" : "Победа"
    }

    exitButton() {
        this.onExit.dispatch()
    }
}
