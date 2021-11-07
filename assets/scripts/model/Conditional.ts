import Global from "../Global"
import { Event } from "../utils/Event"

export const enum EndType {
    Lose = 0,
    Win
}
export class Conditional {
    private _goals = 0
    private _moves = 0
    private _reshuffleCountWithEnd = 0

    constructor() {
        let config = Global.config
        this._goals = config.conditional.goals
        this._moves = config.conditional.moves
        this._reshuffleCountWithEnd = config.reshuffleCountWithEndGame
    }

    get goals() { return Math.max(this._goals, 0) }
    get moves() { return Math.max(this._moves, 0) }
    get reshuffleCount() { return Math.max(this._reshuffleCountWithEnd, 0) }
    get goalsBase() { return Global.config.conditional.goals }
    get movesBase() { return Global.config.conditional.moves }
    get reshuffleCountBase() { return Global.config.reshuffleCountWithEndGame }

    onChange = new Event
    onEnd = new Event

    changeConditional(removesItemCount: number) {
        if (this._checkConditional()) {
            this._moves--
            this._goals -= removesItemCount
            this._checkEnd()
        }
    }

    decrementReshuffleCount() {
        this._reshuffleCountWithEnd--
        this._checkEnd()
    }

    private _checkEnd() {
        this.onChange.dispatch()
        if (this.goals == 0) this.onEnd.dispatch(EndType.Win)
        else if (this.moves == 0 || this.reshuffleCount == 0) this.onEnd.dispatch(EndType.Lose)
    }

    private _checkConditional() {
        return this._moves > 0 && this._goals > 0 
    }
}