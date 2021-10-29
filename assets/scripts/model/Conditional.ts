import Global from "../Global"
import { Event } from "../utils/Event"

export class Conditional {
    private _goals: number = 0
    private _moves: number = 0

    constructor() {
        let config = Global.m.config.conditional
        this._goals = config.goals
        this._moves = config.moves
    }

    get goals() { return Math.max(this._goals, 0) }
    get moves() { return Math.max(this._moves, 0) }
    get goalsBase() { return Global.m.config.conditional.goals }
    get movesBase() { return Global.m.config.conditional.moves }

    onChange = new Event
    onCompleted = new Event
    onLoos = new Event

    onChangeConditional(removesItemCount: number) {
        if (this.checkConditional()) {
            this._moves--
            this._goals -= removesItemCount
            this.onChange.dispatch()
            this.checkLoos()
            this.checkCompleted()
        }
    }

    checkConditional() {
        return this._moves > 0 && this._goals > 0 
    }

    checkLoos() {
        this.moves == 0 && this.onLoos.dispatch()
    }

    checkCompleted() {
        this.goals == 0 && this.onCompleted.dispatch()
    }
}