import Team from './Team';
import themes from './themes';
import cursors from './cursors';
import GameState from './GameState';
import GamePlay from './GamePlay';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import { mix } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    GameState.character = null;
    GameState.from({
      level: 1,
      character: new Team(2, 1, [new Swordsman(), new Bowman(), new Magician()]).lvlUp(),
      step: 'player',
      state: null,
      scores: 0,
      maxLevel: 1,
    });

    this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
    this.gamePlay.redrawPositions(GameState.character);
    this.gamePlay.addNewGameListener(this.init.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoad.bind(this));
    this.gamePlay.addSaveGameListener(this.onSave.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onSave() {
    GameState.from({
      level: GameState.level,
      character: GameState.character,
      scores: GameState.scores,
      maxLevel: GameState.maxLevel,
    });
    this.stateService.storage.clear();
    this.stateService.save(GameState.saveGame);
  }

  onLoad() {
    const loading = this.stateService.load();

    GameState.from({
      level: loading[0].level, character: loading[0].character, step: loading[0].step, scores: loading[0].scores, maxLevel: loading[0].maxLevel,
    });

    this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
    this.gamePlay.redrawPositions(loading[0].character);
  }

  onCellClick(index) {
    function player(el) {
      if (el.position === index && (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman')) {
        return true;
      } return false;
    }
    function computer(el) {
      if (el.position === index && (el.character.type === 'daemon' || el.character.type === 'undead' || el.character.type === 'vampire')) {
        return true;
      } return false;
    }

    const itemComputerIndex = GameState.character.findIndex(computer);
    const itemPlayer = GameState.character.find(player);
    const itemComputer = GameState.character.find(computer);
    if (GameState.step === 'computer') {
      this.com();
    } else if (itemPlayer) {
      GameState.itemPlayer = itemPlayer;
      GameState.possibleAttack = GameController.possible(itemPlayer.character.movesAttack, index);
      GameState.possibleMoves = GameController.possible(itemPlayer.character.Moves, index);
      if (!GameState.state && GameState.state !== 0) {
        this.gamePlay.selectCell(index);
        GameState.state = index;
      } else {
        this.gamePlay.deselectCell(GameState.state);
        GameState.state = index;
        this.gamePlay.selectCell(index);
      }
    } else if (!itemPlayer && !itemComputer && GameState.possibleMoves && GameState.possibleMoves.includes(index)) {
      GameState.itemPlayer.position = index;
      this.gamePlay.redrawPositions(GameState.character);
      this.gamePlay.deselectCell(GameState.state);
      this.gamePlay.deselectCell(index);
      GameState.state = null;
      GameState.itemPlayer = null;
      GameState.possibleAttack = null;
      GameState.possibleMoves = null;
      GameState.step = 'computer';
      this.onCellClick(index);
    } else if (itemComputer && GameState.possibleAttack && GameState.possibleAttack.includes(index)) {
      const damage = Math.round(Math.max(GameState.itemPlayer.character.attack - itemComputer.character.defence, GameState.itemPlayer.character.attack * 0.1));
      GameState.itemComputer = itemComputer;
      GameState.itemComputer.character.health -= damage;
      this.gamePlay.showDamage(index, damage).then(() => {
        this.gamePlay.deselectCell(GameState.state);
        this.gamePlay.deselectCell(index);
        if (GameState.itemComputer.character.health <= 0) {
          GameState.character.splice(itemComputerIndex, 1);
        }
        this.gamePlay.redrawPositions(GameState.character);
        GameState.state = null;
        GameState.itemPlayer = null;
        GameState.possibleAttack = null;
        GameState.possibleMoves = null;
        GameState.step = 'computer';
        this.onCellClick(index);
      });
    } else {
      GamePlay.showError('Недопустимый ход...');
    }
  }

  onCellEnter(index) {
    GameState.character.forEach((el) => {
      if (el.position === index) {
        const message = `${String.fromCodePoint(0x1F396)} ${el.character.level} ${String.fromCodePoint(0x2694)} ${el.character.attack} ${String.fromCodePoint(0x1F6E1)} ${el.character.defence} ${String.fromCodePoint(0x2764)} ${el.character.health}`;
        this.gamePlay.showCellTooltip(message, index);
        if (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman') {
          this.gamePlay.setCursor(cursors.pointer);
        }
      }
    });
    function computer(el) {
      if (el.position === index && (el.character.type === 'vampire' || el.character.type === 'undead' || el.character.type === 'daemon')) {
        return true;
      } return false;
    }
    const itemComputer = GameState.character.find(computer);
    if (GameState.possibleMoves && GameState.possibleMoves.includes(index) && GameState.state !== index && !itemComputer) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    }
    if (itemComputer && GameState.possibleAttack && GameState.possibleAttack.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.notallowed);
    this.gamePlay.deselectCell(index);
    if (GameState.state) {
      this.gamePlay.selectCell(GameState.state);
    }
  }

  static possible(step, index) {
    const list = [];
    for (let i = 0; i <= step * 2; i += 1) {
      let n = index - step * 9 + i * 8;
      const x = index - step * 8 + i * 8;
      for (let y = 0; y <= step * 2; y += 1) {
        if (Math.trunc(n / 8) === Math.trunc(x / 8) && n >= 0 && n <= 63) {
          list.push(n++);
        } else { n++; }
      }
    }
    return list;
  }

  com() {
    const listComputer = [];
    const listPlayer = [];
    let listAttack = [];
    GameState.character.forEach((el) => {
      if (el.character.type === 'vampire' || el.character.type === 'undead' || el.character.type === 'daemon') {
        listComputer.push(el);
      }
    });
    GameState.character.forEach((el) => {
      if (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman') {
        listPlayer.push(el);
      }
    });
    if (listComputer.length === 0) {
      listPlayer.forEach((el) => {
        GameState.scores += el.character.health;
      });
      GamePlay.showMessage(`Количество очков: ${GameState.scores}!`);
      GameState.step = 'player';
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.newGameListeners = [];
      this.gamePlay.saveGameListeners = [];
      this.gamePlay.loadGameListeners = [];
      GameState.level += 1;
      GameState.maxLevel += 1;
      if (GameState.level > 4) { GameState.level = 1; }
      let count;
      if (GameState.level === 1 || GameState.level === 2) { count = 1; } else { count = 2; }
      const newCharacter = new Team(count, GameState.maxLevel, [new Bowman(), new Magician(), new Swordsman()]).lvlUp();
      GameState.character = newCharacter;
      this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
      this.gamePlay.redrawPositions(GameState.character);
      this.gamePlay.addNewGameListener(this.init.bind(this));
      this.gamePlay.addLoadGameListener(this.onLoad.bind(this));
      this.gamePlay.addSaveGameListener(this.onSave.bind(this));
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
      return;
    }
    const [chCom] = mix(listComputer);
    listPlayer.forEach((el) => {
      if (GameController.possible(chCom.character.movesAttack, chCom.position).find((i) => i === el.position)) {
        listAttack.push(el);
      }
    });
    if (listAttack.length > 0) {
      [listAttack] = mix(listAttack);
      const damage = Math.round(Math.max(chCom.character.attack - listAttack.character.defence, chCom.character.attack * 0.1));
      listAttack.character.health -= damage;
      this.gamePlay.showDamage(listAttack.position, damage).then(() => {
        if (listAttack.character.health <= 0) {
          GameState.character.splice(GameState.character.indexOf(listAttack), 1);
          if (listPlayer.length === 1) {
            GamePlay.showMessage(`Вы набрали очков: ${GameState.scores}!. Нажмите начать новую игру.`);
            this.gamePlay.redrawPositions(GameState.character);
            return;
          }
        }
        this.gamePlay.redrawPositions(GameState.character);
      });
    } else {
      const m = mix(GameController.possible(chCom.character.Moves, chCom.position));
      [...listPlayer, ...listComputer].forEach((el) => {
        if (GameController.possible(chCom.character.Moves, chCom.position).find((i) => i === el.position)) {
          m.splice(m.indexOf(el.position), 1);
        }
      });
      chCom.position = m[0];
      this.gamePlay.redrawPositions(GameState.character);
    }
    GameState.step = 'player';
  }
}
