import Config from "./Config"

export default class Global {
    // static m: Global
    config = new Config()

    private static _instance: Global
    static get instance() { return this._instance || (this._instance = new Global()) }

    static get config() { return Global.instance.config }
}