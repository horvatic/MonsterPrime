
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

fs = require('fs');
fs.writeFile('pc.msprime', 'INIT', function (err) {
});

function addMonsters() {
  const mosnters = getMosntersList();
  const mosnterPick = parseInt($gameVariables.value(0002));
  const actorPick = parseInt($gameVariables.value(0003));
  if(mosnterPick == 0 || mosnters.length <= mosnterPick) {
    return;
  }
  if(actorPick == 0 || actorPick < 1 || actorPick > 8) {
    return;
  }
  $gameActors.actor(actorPick).setName(mosnters[mosnterPick])
  $gameParty.addActor(actorPick)
  $gamePlayer.refresh()
}

function readMonsters() {
    const mosnters = getMosntersList();
    var pcList = "";
    mosnters.forEach((m, index) => {
      if (m != 'INIT') {
        pcList += index + ": " + m + "\n"
      }
    });
    $gameVariables.setValue(0001, pcList);
}

function catchMonster(name){
    fs.appendFileSync('pc.msprime', "," + name);
}

function getMosntersList() {
  try {
    const data = fs.readFileSync('pc.msprime', 'utf8');
    const mosnters = data.split(',');
    return mosnters;
  } catch (err) {
    return null;
  }
}