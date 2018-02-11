var player1,player2,player; // players
var changingPlayers;
var row = 10, col = 10;
var battle = {};
var selection = 'h';
var hitResult = document.getElementById("hitResult");
var result = document.getElementById("result");
battle.goToScreen = function (id) {
    document.querySelectorAll('.screen').forEach(function (el) {
        el.style.display = "none";
    });
    document.getElementById(id).style.display = 'block';
}

function getGrid() {
    var grid = [];
    for (var i = 0; i < 10; i++) {
        var rowGrid = [];
        for (var j = 0; j < 10; j++) {
            var cell = {
                id: i + '' + j
            }
            rowGrid.push(cell);
        }
        grid.push(rowGrid);
    }
    return grid;
}


class Player {
    constructor(id,name) {
        this.name = name;
        this.id = id;
        this.grid = getGrid();
        this.ships = {
            'aircraftCarrier': {
                length: 5, cell: [], name:'Aircraft Carrier', next: 'battleship'
            },
            'battleship': { 
                length: 4, cell: [], next: 'submarine', name:'Battleship'
            },
            'submarine': {
                length: 3, cell: [], next: 'cruiser', name:'SubMarine'
            },
            'cruiser': {
                length: 3, cell: [], next: 'destroyer', name:'Cruiser'
            },
            'destroyer': {
                length: 2, cell: [], name:'Destroyer'
            }
        };
        this.shipSelection = '';
        this.markedIndex = [];
    }
    drawBattleShip() {//create battleship cells
        var gridDiv = document.getElementById('battle-ground');
        gridDiv.innerHTML = '';
        var tbl = document.createElement('table');
        tbl.className = 'grid';
        var tbdy = document.createElement('tbody');
        this.grid.forEach(row => {
            var tr = document.createElement('tr');
            row.forEach(cell => {
                var td = document.createElement('td');
                td.id = cell.id;
                if (this.shipSelection) {//handles cell highlighting and ship placement clicks
                    td.onmouseover = function (e) {
                        handleHover(e)
                    }
                    td.onmouseout = function (e) {
                        removeHighLight();
                    }
                    td.onclick = function (e) {
                        handleClick(e)
                    }
                } else {//handles hit
                    if(cell.isShip && cell.isHit)
                        td.style.backgroundColor = 'red';
                    else if(cell.isHit)
                        td.innerHTML = 'x';
                    td.onclick = function (e) {
                        handleHit(e)
                    }
                }
                tr.appendChild(td)
            });
            tbdy.appendChild(tr);
        })
        tbl.appendChild(tbdy);
        gridDiv.appendChild(tbl)
    }
}


function removeHighLight() {//removing hightlights made by mouse over
    player.grid.forEach(row => {
        row.forEach(cell => {
            if (player.markedIndex.indexOf(cell.id) == -1)
                document.getElementById(cell.id).classList.remove('highlight');
        });
    })
}

function handleHover(e) {//shipselection mouseover event
    highLightCell(e);
}

function handleClick(e) {//ship selection click event
    if(changingPlayers)
     return;
    highLightCell(e, true);
}

function highLightCell(e, isClick) {// handles ship selection mouseover and selection clicks
    if (player.shipSelection) {
        var ind = e.target.id.toString();
        var ship = player.ships[player.shipSelection];
        var align = selection == 'h' ? 1 : 0;
        if ((10 - ind[align]) >= ship.length) { //check for available space for ships
            var shipLen = ship.length;
            var curPos = parseInt(ind[align]);
            if (!checkMarked(shipLen, ind, curPos, align)) //check for overlapping cells
                return;
            while (shipLen > 0) {
                var id = align ? ind[0] + '' + curPos : curPos + '' + ind[1];
                document.getElementById(id).classList.add('highlight');
                if (isClick) {//if the event is click
                    player.markedIndex.push(id);//push the cell id to maeked index
                    player.ships[player.shipSelection].cell.push({ id, isHit: 0 });//storing the ship index in player obj
                    player.grid[id[0]][id[1]].isShip = 1;
                    player.grid[id[0]][id[1]].shipType = player.shipSelection;
                }
                curPos++;
                shipLen--;
            }
            if (isClick) {
                player.shipSelection = ship.next;
                if(!ship.next && player.id == '1') {// swapping selection to second player
                    player2.shipSelection = 'aircraftCarrier';
                    changePlayer(player2);
                } else if(!ship.next) { // After placement of ships by both players
                    document.getElementById('align').style.display = 'none';
                    document.getElementById('battle-ground').style.display = 'none';
                    document.getElementById('name').style.display = 'none';
                    changePlayer(player2, true); 
                    document.getElementById('play').style.display = 'block';
                }
            }         
        }
    }
}

function checkMarked(shipLen, ind, curPos, align) { // function to check clicked cell is marked to avoid placement overlapping
    var valid = true;
    while (shipLen > 0) {
        var id = align ? ind[0] + '' + curPos : curPos + '' + ind[1];
        if (player.markedIndex.indexOf(id) != -1)
            valid = false;
        curPos++;
        shipLen--;
    }
    return valid;
}

function changeAlign() { // handles vertical and horizontal align of ships
    selection = selection == 'h' ? 'v' : 'h';
    document.getElementById('align').innerHTML = selection == 'h' ? 'Vertical' : 'Horizontal';
}

function play() { // initiating the game after placement selection of ships
    document.getElementById('play').style.display = 'none';
    document.getElementById('battle-ground').style.display = 'block';
    document.getElementById('name').style.display = 'block';
    player.shipSelection = null;
    player.drawBattleShip();
}

function handleHit(e) { // handles the hit
    if(changingPlayers)
        return;
    var id = e.target.id;
    if (player.grid[id[0]][id[1]].isHit) {
        hitResult.innerHTML = "Already Taken";
        return;
    }
    player.grid[id[0]][id[1]].isHit = 1;
    var grid = player.grid[id[0]][id[1]];
    var cell = document.getElementById(id);
    if (player.markedIndex.indexOf(id) == -1) { // if the clicked cell is not in marked index
        cell.innerHTML = 'x'; // mark it as x
        var curPlayer = player.id == '1'?player2:player1;
        curPlayer.shipSelection = null;
        changePlayer(curPlayer);  // swap the player
    } else {
        player.ships[grid.shipType].cell = player.ships[grid.shipType].cell.map(ind => {
            if (ind.id == id)
                ind.isHit = 1;
            return ind;
        })
        cell.style.backgroundColor = 'red'; // changes the cell backf=ground to red
    }
    handleHitStatus(grid.shipType);
}

function handleHitStatus(ship) { // handles displaying  status after hit
    if (!ship) {
        hitResult.innerHTML = "Miss";
    } else {
        var allHit = true;
        player.ships[ship].cell.map(ind => {
            if (!ind.isHit)
                allHit = false;
        })
        if (allHit) {
            if (checkAllShipSinked()) {
                var name = player.id == '1'?player2.name:player1.name;
                result.innerHTML = name+" wins";
                battle.goToScreen('screen3');
            }
            else
                hitResult.innerHTML = "Ship Sunk";
        }
        else
            hitResult.innerHTML = "Hit";
    }
}

function checkAllShipSinked() { // check all ships sinked and decides the winner
    var allShipSinked = true;
    for (var ship in player.ships) {
        player.ships[ship].cell.forEach(d => {
            if (!d.isHit)
                allShipSinked = false;
        })
    }
    return allShipSinked;
}

function changePlayer(curPlayer, noDraw) { // swapping the players
    if(changingPlayers)
        return;
    changingPlayers = true;
    player = curPlayer;
    setTimeout(() => {
        var msg = player.shipSelection?' place your ship':' turn';
        var name = player.shipSelection?player.name:player.id == '1'?player2.name:player1.name;
        document.getElementById("name").innerHTML = name + msg;
        document.getElementById("hitResult").innerHTML = "";
        if(!noDraw)
            player.drawBattleShip();
        changingPlayers = false;
    },1000)
}


// Initializing
player1 = new Player('1','Player1');
player2 = new Player('2','Player2');
player1.shipSelection = 'aircraftCarrier';
changePlayer(player1);