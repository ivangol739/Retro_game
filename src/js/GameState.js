export default class GameState {
  static from(object) {
    this.level = object.level;
    this.character = object.character;
    this.step = object.step;
    this.state = object.state;
    this.possibleMoves = object.possibleMoves;
    this.possibleAttack = object.possibleAttack;
    this.itemPlayer = object.itemPlayer;
    this.itemComputer = object.itemComputer;
    this.scores = object.scores;
    this.maxLevel = object.maxLevel;
    this.saveGame = [{
      level: this.level,
      character: this.character,
      step: this.step,
      scores: this.scores,
      maxLevel: this.maxLevel,
    }];
    return null;
  }
}
