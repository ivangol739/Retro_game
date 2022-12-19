export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const item = Object.create(allowedTypes[Math.floor(Math.random() * allowedTypes.length)]);
    item.level = Math.floor(Math.random() * maxLevel) + 1;
    yield item;
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const item = characterGenerator(allowedTypes, maxLevel);
  const listTeam = [];
  for (let i = 0; i < characterCount; i += 1) {
    const character = item.next().value;
    character.attack = character.__proto__.attack;
    character.defence = character.__proto__.defence;
    character.health = character.__proto__.health;
    character.type = character.__proto__.type;
    character.movesAttack = character.__proto__.movesAttack;
    character.Moves = character.__proto__.Moves;
    listTeam[i] = character;
  }
  return listTeam;
}
export function mix(listTeam) {
  for (let i = listTeam.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [listTeam[i], listTeam[j]] = [listTeam[j], listTeam[i]];
  }
  return listTeam;
}
