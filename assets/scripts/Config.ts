import { TileState } from "./model/Tile"

export default class Config {
    gridSize: cc.Vec2 = cc.v2(6, 6)
    boosterRandomTilesCount = 4
    boosterReshuffleTilesCount = 5
    boosterMegaBombTilesCount = 9
    listBoosterTilesCount = [this.boosterRandomTilesCount, this.boosterReshuffleTilesCount, this.boosterMegaBombTilesCount]
    simpleBoostersList = [TileState.Horizontal, TileState.Vertical, TileState.Bomb]
    bombRadius = 1
    speedAnimation = 1

    conditional = {
        moves: 10,
        goals: 30
    }

    reshuffleCountWithEndGame = 3
    defaultBoostersCountForGame = 5
    inventoryBoostersList = [TileState.Bomb, TileState.Reshuffle, TileState.RemoveAll]
    transitionBetweenScenesTime = 0.6
}