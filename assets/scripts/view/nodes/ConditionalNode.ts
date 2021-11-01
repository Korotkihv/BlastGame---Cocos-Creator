import { Conditional } from "../../model/Conditional";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ConditionalNode extends cc.Component {
    @property(cc.Label) moves: cc.Label = null
    @property(cc.Label) goals: cc.Label = null
    @property(cc.Label) reshuffle: cc.Label = null
    @property(cc.ProgressBar) progressMoves: cc.ProgressBar = null
    @property(cc.ProgressBar) progressGoals: cc.ProgressBar = null

    private _conditional: Conditional = null

    setConditional(conditional: Conditional) {
        this._conditional = conditional
        this._conditional.onChange.add(this.node, () => this._updateProgress())
        this._updateProgress()
    }

    private _updateProgress() {
        this.moves.string = `${this._conditional.moves}/${this._conditional.movesBase}`
        this.goals.string = `${this._conditional.goals}/${this._conditional.goalsBase}`
        this.reshuffle.string = `${this._conditional.reshuffleCount}`

        this.progressMoves.progress = this._conditional.moves / this._conditional.movesBase
        this.progressGoals.progress = this._conditional.goals / this._conditional.goalsBase
    }
}
