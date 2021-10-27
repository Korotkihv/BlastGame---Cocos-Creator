import Config from "./Config"

export default class Global {
    static m: Global
    config = new Config()
}