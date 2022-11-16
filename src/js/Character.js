export default class Character {
  constructor(level, type = 'generic') {
    if (new.target.name === Character) {
      throw new Error('Impossible create instance');
    }
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }
}
