import { TileState } from "./model/Tile"

export default class Config {
    GridSize: cc.Vec2 = cc.v2(11, 11)
    BoosterRandomTilesCount = 2
    BoosterReshufleTilesCount = 7
    BoosterMegaBombTilesCount = 8
    ListBoosterTilesCount = [this.BoosterRandomTilesCount, this.BoosterReshufleTilesCount, this.BoosterMegaBombTilesCount]
    SimpleBoostersList = [TileState.Horizontal, TileState.Vertical, TileState.Bomb]
    BombRadius = 1
    SpeedAnimation = 1
}