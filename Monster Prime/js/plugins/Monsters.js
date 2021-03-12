
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

//Export to RPG maker for adding monster to party
function addMonsters() {
  const caughtMosnters = getCaughtMosnters();
  const mosnters = getMosnters();
  const actorPick = parseInt($gameVariables.value(0003));
  var mosnterPick = parseInt($gameVariables.value(0002));
  if(actorPick == 0 || mosnterPick < 1) {
    return
  }
  if(actorPick < 1 || actorPick > 8) {
    return;
  }

  const mIds = $gameVariables.value(0004).split(",")
  if(mIds.length <= mosnterPick) {
    return;
  }
  const mosnter = caughtMosnters.find(m => m.id == mIds[mosnterPick]);
  const mosnterMetaData = mosnters.find(m => m.monster == mosnter.name);
  $gameActors.actor(actorPick).setName(mosnter.name)
  $gameActors.actor(actorPick).changeClass(mosnterMetaData.classId, false)
  $gameActors.actor(actorPick).changeLevel(mosnter.level, false)
  $gameActors.actor(actorPick).changeExp(mosnter.xp, false)
  $gameParty.addActor(actorPick)
  $gamePlayer.refresh()

  mosnter.inParty = true
  fs.writeFileSync(dbCatchStore, JSON.stringify(caughtMosnters));
}

//Export to RPG maker for reading all caught monsters
function readMonstersNotInParty() {
    const mosnters = getCaughtMosnters();
    var mNames = "";
    var mIds = "buffer"
    mosnters.forEach((m, index) => {
      if(!m.inParty) {
        mNames += (index + 1) + ": " + m.name + "\n"
        mIds += "," + m.id
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