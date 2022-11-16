import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import { generateTeam, mix } from './generators';

export default class Team {
  constructor(characterCount, maxLevel, typesPlayer) {
    this.characterCount = characterCount;
    this.maxLevel = maxLevel;
    this.typesPlayer = typesPlayer;
    this.typesComputer = [new Daemon(), new Undead(), new Vampire()];
    this.positionPlayer = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
    this.positionComputer = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
  }

  lvlUp() {
    const listTeam = [];
    const genPlayer = generateTeam(this.typesPlayer, this.maxLevel, this.characterCount);
    if (GameState.character) {
      GameState.character.forEach((e) => {
        e.character.level += 1;
        e.character.defence = Math.round(Math.max(e.character.defence, e.character.defence * (1.8 - (1 - e.character.health / 100))));
        e.character.attack = Math.round(Math.max(e.character.attack, e.character.attack * (1.8 - (1 - e.character.health / 100))));
        e.character.health += 80;
        if (e.character.health > 100) {
          e.character.health = 100;
        }
        genPlayer.push(e.character);
      });
      while (genPlayer.length > 10) {
        genPlayer.shift();
      }
    }

    const posPlayer = mix(this.positionPlayer);

    for (let i = 0; i <= genPlayer.length - 1; i += 1) {
      listTeam.push(new PositionedCharacter(genPlayer[i], posPlayer[i]));
    }

    const genComputer = generateTeam(mix(this.typesComputer), this.maxLevel, genPlayer.length);
    const posComputer = mix(this.positionComputer);

    for (let i = 0; i <= genComputer.length - 1; i += 1) {
      listTeam.push(new PositionedCharacter(genComputer[i], posComputer[i]));
    }
    return listTeam;
  }
}
