import { Tile } from "./Tile";
import { Grid } from "./Grid";
import Global from "../Global";

export interface GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid)
}

export class SimpleStrategy implements GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid) {
        tile.remove()
        return [tile]
    }
}

export class HorizontalStrategy implements GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid) {
        tile.remove()
        let r = [tile]
        for (let line = 0; line < grid.rowsCount; line++) {
            let removeTile = grid.board[tile.pos.x][line]
            if (removeTile.isNormal) r = r.concat(removeTile.getRemoveStrategy.getRemoveTiles(removeTile, grid))
        } 
        return r
    }
}

export class VerticalStrategy implements GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid) {
        tile.remove()
        let r = [tile]
        for (let line = 0; line < grid.columnCount; line++) {
            let removeTile = grid.board[line][tile.pos.y]
            if (removeTile.isNormal) r = r.concat(removeTile.getRemoveStrategy.getRemoveTiles(removeTile, grid))
        } 
        return r
    }
}

export class BombStrategy implements GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid) {
        tile.remove()
        let r = [tile]
        let size = Global.config.bombRadius
        for (let row = tile.pos.x - size; row <= tile.pos.x + size; row++) {
            for (let column = tile.pos.y - size; column <= tile.pos.y + size; column++) {
                let removeTile = grid.board[row][column]
                if (grid.isValidPick(cc.v2(row, column)) && removeTile.isNormal) {
                    r = r.concat(removeTile.getRemoveStrategy.getRemoveTiles(removeTile, grid))
                }
            } 
        } 
        return r
    }
}

export class SuperBombStrategy implements GridRemoveStrategy {
    getRemoveTiles(tile: Tile, grid: Grid) {
        let r = []
        for (let row = 0; row < grid.rowsCount; row++) {
            for (let column = 0; column < grid.columnCount; column++) {
                // todo return grid
                grid.board[row][column].remove()
                r.push(grid.board[row][column])
            }
        }
        return r
    }
}