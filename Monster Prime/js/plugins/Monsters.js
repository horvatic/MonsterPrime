
//=============================================================================
// Monsters.js
//=============================================================================

/*:
* @plugindesc Functions for Monsters
* @author Shawn Horvatic
*
* @help This plugin does not provide plugin commands.
*
*/

// Refs https://kinoar.github.io/rmmv-doc-web/classes/game_actor.html

dbCatchStore = 'monsterdata/catchStore.json';
dbMonsterStore = 'monsterdata/monsterStore.json';
fs = require('fs');

try {
  if (!fs.existsSync(dbCatchStore)) {
    fs.writeFileSync(dbCatchStore, '[]');
  }
} catch(err) {
  console.error(err)
}

//Export to RPG maker for remove monster to party
function removeMonsters() {
  const actorPick = parseInt($gameVariables.value(0003));
  if(actorPick == 0) {
    return
  }
  if(actorPick < 1 || actorPick > 8) {
    return;
  }
  $gameParty.removeActor(actorPick)
  if($gameParty.isEmpty()) {
    addActor(actorPick, "You", 0001, 1, 0)
  }
  reOrderActors();
  $gamePlayer.refresh()
}

//Export to RPG maker for adding monster to party
function addMonsters() {
  const caughtMosnters = getCaughtMosnters();
  const mosnters = getMosnters();
  var mosnterPick = parseInt($gameVariables.value(0002));
  if($gameParty.members().length + 1 >= 8 || mosnterPick < 1) {
    return
  }

  const mIds = $gameVariables.value(0004).split(",")
  if(mIds.length <= mosnterPick) {
    return;
  }
  const mosnter = caughtMosnters.find(m => m.id == mIds[mosnterPick]);
  const mosnterMetaData = mosnters.find(m => m.monster == mosnter.name);
  const actorPick = $gameParty.members().length + 1
  addActor(actorPick, mosnter.name, mosnterMetaData.classId, mosnter.level, mosnter.xp)

  mosnter.inParty = true
  fs.writeFileSync(dbCatchStore, JSON.stringify(caughtMosnters));
}

//Export to RPG maker for reading all caught monsters in party
function readMonstersInParty() {
  var mNames = "";
  var currentIndex = 1
  $gameParty.members().forEach(m => {
    mNames += currentIndex + ": " + m.name() + "\n"
    currentIndex++
  });
  $gameVariables.setValue(0001, mNames);
}

//Export to RPG maker for reading all caught monsters not in party
function readMonstersNotInParty() {
    const mosnters = getCaughtMosnters();
    var mNames = "";
    var mIds = "buffer"
    var currentIndex = 1
    mosnters.forEach(m => {
      if(!m.inParty) {
        mNames += currentIndex + ": " + m.name + "\n"
        mIds += "," + m.id
        currentIndex++
      }
    });
    $gameVariables.setValue(0001, mNames);
    $gameVariables.setValue(0004, mIds);
}

//Export to RPG maker for catching monsters
function catchMonster(){
  const m = getCaughtMosnters();
  var newMonster = {}
  newMonster.name = $gameTroop.members()[0].enemy().name
  newMonster.level = 1
  newMonster.xp = 0
  newMonster.inParty = false
  newMonster.id = uuidv4()
  m.push(newMonster);
  fs.writeFileSync(dbCatchStore, JSON.stringify(m));
}

function getMosnters() {
  try {
    const data = fs.readFileSync(dbMonsterStore, 'utf8');
    return JSON.parse(data)
  } catch (err) {
    return null;
  }
}

function getCaughtMosnters() {
  try {
    const data = fs.readFileSync(dbCatchStore, 'utf8');
    return JSON.parse(data)
  } catch (err) {
    return null;
  }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function addActor(actorPick, name, classId, level, xp) {
  $gameActors.actor(actorPick).setName(name)
  $gameActors.actor(actorPick).changeClass(classId, false)
  $gameActors.actor(actorPick).changeLevel(level, false)
  $gameActors.actor(actorPick).changeExp(xp, false)
  $gameParty.addActor(actorPick)
  $gamePlayer.refresh()
}

function reOrderActors() {
  var actors = []
  $gameParty.members().forEach(m => {
    actors.push(m);
  });

  for (i = 1; i < 9; i++) {
    $gameParty.removeActor(i)
  }
  actors.forEach((m, index) => {
    addActor(index + 1, m.name(), m.currentClass().id, m.level, m.currentExp())
  });
  $gamePlayer.refresh()
}