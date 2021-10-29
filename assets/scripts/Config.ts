import { TileState } from "./model/Tile"

export default class Config {
    GridSize: cc.Vec2 = cc.v2(3, 3)
    BoosterRandomTilesCount = 30
    BoosterReshufleTilesCount = 6
    BoosterMegaBombTilesCount = 8
    ListBoosterTilesCount = [this.BoosterRandomTilesCount, this.BoosterReshufleTilesCount, this.BoosterMegaBombTilesCount]
    SimpleBoostersList = [TileState.Horizontal, TileState.Vertical, TileState.Bomb]
    BombRadius = 1
    SpeedAnimation = 1

    conditional = {
        moves: 10,
        goals: 30
    }
}