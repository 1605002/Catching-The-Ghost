let transps = document.getElementsByClassName("transp");

let sensorCloseps = document.getElementsByClassName("sensor-close-p");
let sensorMediumps = document.getElementsByClassName("sensor-medium-p");
let sensorFarps = document.getElementsByClassName("sensor-far-p");

let samep = document.getElementById("same-p");
let calcSame = () => {
    let sameprob = 100;
    for(let transp of transps) {
        if(transp.id != "same-p") sameprob -= transp.value;
    }

    samep.value = sameprob.toFixed(1);
};

let closeGreen = document.getElementById("close-green-p");
let calcCloseGreen = () => {
    let sameprob = 100;
    for(let closep of sensorCloseps) {
        if(closep.id != "close-green-p") sameprob -= closep.value;
    }

    closeGreen.value = Math.round(sameprob);
};

let mediumGreen = document.getElementById("medium-green-p");
let calcMediumGreen = () => {
    let sameprob = 100;
    for(let mediump of sensorMediumps) {
        if(mediump.id != "medium-green-p") sameprob -= mediump.value;
    }

    mediumGreen.value = Math.round(sameprob);
};

let farGreen = document.getElementById("far-green-p");
let calcFarGreen = () => {
    let sameprob = 100;
    for(let farp of sensorFarps) {
        if(farp.id != "far-green-p") sameprob -= farp.value;
    }

    farGreen.value = Math.round(sameprob);
};

for(let transp of transps) {
    transp.addEventListener("blur", calcSame);
}

for(let closep of sensorCloseps) {
    closep.addEventListener("blur", calcCloseGreen);
}
for(let mediump of sensorMediumps) {
    mediump.addEventListener("blur", calcMediumGreen);
}
for(let farp of sensorFarps) {
    farp.addEventListener("blur", calcFarGreen);
}

/******************************** Main code starts ***********************************/

let n, m, g;
let near, far;
let belief;
let ghostsx, ghostsy;
let dirx = [-1, 1, 0, 0, -1, 1, 1, -1, 0];
let diry = [0, 0, -1, 1, -1, -1, 1, 1, 0];
let movep, transp, sensorp;
let sensorState;

let innerVal = id => document.getElementById(id).value;
let innerValp = id => innerVal(id)/100;
let isValidCell = (x, y) => { return x >= 0 && x < n && y >= 0 && y < m; }

let initialize = () => {
    calcSame();
    calcCloseGreen();
    calcMediumGreen();
    calcFarGreen();

    /* Initialize n, m, g, near and far */

    n = document.getElementById("rows").value;
    m = document.getElementById("cols").value;
    g = document.getElementById("ghosts").value;

    near = document.getElementById("near").value, far = document.getElementById("far").value;

    let bcont = document.getElementById("board-container");
    bcont.innerHTML = "";

    let tableGrid = document.createElement("table");
    bcont.appendChild(tableGrid);

    /* Initialize the html table to show probabilites */

    belief = [];

    for(let i = 0; i < n; i++) {
        belief.push([]);

        let newRow = document.createElement("tr");
        tableGrid.appendChild(newRow);

        for(let j = 0; j < m; j++) {
            belief[i][j] = 1/(n*m);

            let newCell = document.createElement("td");
            newRow.appendChild(newCell);

            newCell.id = `cell-${i}-${j}`;
        }
    }

    /* Create ghosts and initialize them */

    ghostsx = [], ghostsy = [];
    for(let k = 0; k < g; k++) {
        let r = Math.random(), ald = 0;

        for(let i = 0; i < n; i++) {
            let done = false;

            for(let j = 0; j < m; j++) {
                ald += belief[i][j];
                if(ald > r) {
                    ghostsx.push(i);
                    ghostsy.push(j);

                    done = true;
                    break;
                }
            }
            if(done) break;
        }
    }

    /* Create transition probability table */

    transp = [];
    for(let i1 = 0; i1 < n; i1++) {
        transp.push([]);
        for(let j1 = 0; j1 < m; j1++) {
            transp[i1].push([]);
            for(let i2 = 0; i2 < n; i2++) {
                transp[i1][j1].push([]);
                for(let j2 = 0; j2 < m; j2++) transp[i1][j1][i2].push(0);
            }
        }
    }

    /* Generate transition probabilities from all cells to all cells */

    movep = [innerValp("up-p"), innerValp("down-p"), innerValp("left-p"), innerValp("right-p"), innerValp("up-left-p"),
            innerValp("down-left-p"), innerValp("down-right-p"), innerValp("up-right-p"), innerValp("same-p")];

    for(let i1 = 0; i1 < n; i1++) {
        for(let j1 = 0; j1 < m; j1++) {
            let totp = 0;

            for(let k = 0; k < 9; k++) {
                let i2 = i1+dirx[k], j2 = j1+diry[k];
                if(isValidCell(i2, j2)) totp += movep[k];
            }

            for(let k = 0; k < 9; k++) {
                let i2 = i1+dirx[k], j2 = j1+diry[k];
                if(isValidCell(i2, j2)) transp[i1][j1][i2][j2] = movep[k]/totp;
            }
        }
    }

    // Generate sensor probabilies

    sensorp = [[], [], []];
    let fw = ["close", "medium", "far"], sw = ["red", "orange", "green"];

    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) sensorp[i][j] = document.getElementById(`${fw[i]}-${sw[j]}-p`).value/100;
    }

    /* A function that returns a new n*m size 0 filled 2D array */

    let getTmpBoard = () => {
        let tmpBoard = [];
        for(let i = 0; i < n; i++) {
            tmpBoard.push([]);
            for(let j = 0; j < m; j++) tmpBoard[i].push(0);
        }

        return tmpBoard;
    }

    // Normalize the belief[][] array. Take the sum of all elements and divide each element by it

    let normalize = () => {
        let sump = 0;
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) sump += belief[i][j];
        }

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) belief[i][j] /= sump;
        }
    };

    /* Used to determine the color class of the a not-sensed cell by its probability */

    let whichCol = p => {
        if(p < 0.00005) return 3;
        if(p < 0.1) return 4;
        if(p < 0.4) return 5;
        if(p < 0.5) return 6;
        return 7;
    }

    /* Set the html table[i][j] cell textContent to belief[i][j]  */

    let setTextTable = () => {
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) {
                let cell = document.getElementById(`cell-${i}-${j}`);
                cell.textContent = (belief[i][j]*100).toFixed(2);

                let classname = cell.className;
                if(classname !== "state-0" && classname !== "state-1"
                && classname !== "state-2") cell.className = `state-${whichCol(belief[i][j])}`;
            }        
        }
    }

    /* Initialize the first table */
    setTextTable();

    /* Determines which category (close, medium, far) the distance falls in */

    let whichd = d => {
        console.assert(d >= 0);
        
        if(d <= near) return 0;
        if(d <= far) return 1;
        return 2;
    };

    /* Determines the Manhatton distance between cell (i1, j1) and (i2, j2) */

    let getDist = (i1, j1, i2, j2) => Math.abs(i1-i2)+Math.abs(j1-j2);

    /* Generates the sensor state of each cell. Called at the beginning and after each time advance */

    let sense = () => {
        sensorState = [];
        for(let i = 0; i < n; i++) sensorState.push([]);

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) {
                let d = n+m;

                for(let k = 0; k < g; k++) {
                    let x = ghostsx[k], y = ghostsy[k];
                    if(getDist(i, j, x, y) < d) d = getDist(i, j, x, y);
                }

                let cat = whichd(d);

                let r = Math.random();

                if(r < sensorp[cat][0]) sensorState[i][j] = 0;
                else if(r < sensorp[cat][0]+sensorp[cat][1]) sensorState[i][j] = 1;
                else sensorState[i][j] = 2;
            }
        }

        console.log(sensorState);
    };

    sense();

    /* Create 3 game text divs at the bottom */

    let remg = document.createElement("div");
    remg.className = "game-text";
    remg.textContent = `Remaining ghosts: ${g}`;
    bcont.appendChild(remg);

    let cotg = document.createElement("div");
    cotg.className = "game-text";
    bcont.appendChild(cotg);

    let endg = document.createElement("div");
    endg.className = "game-text";
    bcont.appendChild(endg);

    bcont.appendChild(document.createElement("br"));

    /* Create the time+1 button */

    let timeButton = document.createElement("button");
    timeButton.id = "time-advance";
    timeButton.classList.add("game-button");
    timeButton.textContent = "Time+1";
    bcont.appendChild(timeButton);

    /**
     * When the time+1 button is clicked, first check if the game is finished. If yes, return;
     * Then clear the sensor color of all cells.
     * Update the ghost locations according to the transition probability.
     * Update the belief[][] array accrding to the transition probability.
     * Update the html table according to belief by calling setTextTable().
     */

    timeButton.addEventListener("click", () => {
        if(g == 0) return;
        cotg.textContent = "";

        onCatch = false;
        catchButton.style.backgroundColor = "initial";

        for(let k = 0; k < g; k++) {
            let i1 = ghostsx[k], j1 = ghostsy[k];
            let r = Math.random(), ald = 0;

            for(let d = 0; d < 9; d++) {
                let i2 = i1+dirx[d], j2 = j1+diry[d];
                if(isValidCell(i2, j2)) {
                    ald += transp[i1][j1][i2][j2];
                    if(ald > r) {
                        ghostsx[k] = i2, ghostsy[k] = j2;
                        break;
                    }
                }
            }
        }

        sense();

        let tmpBoard = getTmpBoard();

        for(let i2 = 0; i2 < n; i2++) {
            for(let j2 = 0; j2 < m; j2++) {
                for(let k = 0; k < 9; k++) {
                    let i1 = i2+dirx[k], j1 = j2+diry[k];
                    if(isValidCell(i1, j1)) tmpBoard[i2][j2] += belief[i1][j1]*transp[i1][j1][i2][j2];
                }
            }
        }

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) {
                belief[i][j] = tmpBoard[i][j];
                document.getElementById(`cell-${i}-${j}`).className = "";
            }
        }

        setTextTable();
    });

    /* Create the catch button */

    let catchButton = document.createElement("button"), onCatch = false;
    catchButton.id = "catch";
    catchButton.classList.add("game-button");
    catchButton.textContent = "Catch";
    bcont.appendChild(catchButton);

    /** 
    * If the catch button is called and the game is not finished, 
    * flip the onCatch boolean and update catch button background color
    */

    catchButton.addEventListener("click", () => {
        if(g == 0) return;
        cotg.textContent = "";

        onCatch = !onCatch;

        if(onCatch) catchButton.style.backgroundColor = "#eb867f";
        else catchButton.style.backgroundColor = "initial";
    });

    /**
     * When a cell is clicked in catch mode, deletes all the ghosts in it.
     * If any ghost was actaully caught, show appropriate message in game text.
     * Set the belief of the clicked cell to 0 (as there are no more ghosts in here)
     * Normalize the belief ara and update the html table according to it.
     */

    let handleCatch = (x, y) => {
        console.log(`Tried to catch in (${x}, ${y})`);

        let tmpgx = [], tmpgy = [];
        for(let k = 0; k < g; k++) {
            let gx = ghostsx[k], gy = ghostsy[k];
            if(gx != x || gy != y) {
                tmpgx.push(gx);
                tmpgy.push(gy);
            }
        }

        cg = ghostsx.length-tmpgx.length;
        ghostsx = [...tmpgx], ghostsy = [...tmpgy];
        g -= cg;

        remg.textContent = `Remaining ghosts: ${g}`;

        let txt = "No ghost was in that cell";
        if(cg === 1) txt = "1 ghost caught!"
        else txt = `${cg} ghosts caught!`;

        cotg.textContent = txt;

        if(g == 0) {
            endg.textContent = "You have won!!!";
            return;
        }

        belief[x][y] = 0;

        normalize();
        setTextTable();
    }

    /**
     * When a cell is clicked in sense mode, show the sensor state by changing color.
     * If it was already clicked, do nothing.
     * Otherwise update belief according to HMM filtering algorithm.
     * Normalize belief[][] and update the html table.
     */

    let handleSensor = (x, y) => {
        console.log(`Tried to sense in (${x}, ${y})`);

        let curClass = `state-${sensorState[x][y]}`;

        let cell = document.getElementById(`cell-${x}-${y}`);
        if(cell.className == curClass) return;

        cell.className = curClass;
        let tmpBoard = getTmpBoard();

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) {
                let nearp = 0, nearFarp = 0, selfCat = whichd(getDist(i, j, x, y));;

                for(let ni = 0; ni < n; ni++) {
                    for(let nj = 0; nj < m; nj++) {
                        let cat = whichd(getDist(ni, nj, x, y));

                        if(cat < 2) nearFarp += belief[ni][nj];
                        if(cat < 1) nearp += belief[ni][nj];
                    }
                }

                nearp = 1-nearp, nearFarp = 1-nearFarp;
                nearp **= g-1, nearFarp **= g-1;
                nearp = 1-nearp, nearFarp = 1-nearFarp;

                let evidencep = 0, col = sensorState[x][y];

                if(selfCat == 0) evidencep += sensorp[0][col];
                else evidencep += nearp*sensorp[0][col];

                if(selfCat == 1) evidencep += (1-nearp)*sensorp[1][col];
                else if(selfCat == 2) evidencep += (nearFarp-nearp)*sensorp[1][col];

                if(selfCat == 2) evidencep += (1-nearFarp)*sensorp[2][col];

                tmpBoard[i][j] = belief[i][j]*evidencep;
            }
        }

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) belief[i][j] = tmpBoard[i][j];
        }

        normalize();
        setTextTable();
    }

    /**
     * Add an event handler to each html table cell.
     * If a cell is clicked, it will call either handleCatch() or handleSensor() functions.
     * Which one will be called, that depends on the onCatch boolean.
     * The cell number (i, j) will be passed as parameters to the called function.
     */

    for(let i = 0; i < n; i++) {
        for(let j = 0; j < m; j++) {
            document.getElementById(`cell-${i}-${j}`).addEventListener("click", e => {
                if(g == 0) return;

                let s = e.target.id.split("-");
                let i = Number(s[1]), j = Number(s[2]);

                if(onCatch) handleCatch(i, j);
                else handleSensor(i, j);
            });
        }
    }
};

/* This big initiallize() function will be called
each time user clicks the "set-board" button and also at the beginng. */

let setBoard = document.getElementById("set-board");
setBoard.addEventListener("click", initialize);

initialize();