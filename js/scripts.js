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

    n = document.getElementById("rows").value;
    m = document.getElementById("cols").value;
    g = document.getElementById("ghosts").value;

    near = document.getElementById("near").value, far = document.getElementById("far").value;

    let bcont = document.getElementById("board-container");
    bcont.innerHTML = "";

    let tableGrid = document.createElement("table");
    bcont.appendChild(tableGrid);

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
            newCell.textContent = (belief[i][j]*100).toFixed(2);
        }
    }

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

    sensorp = [[], [], []];
    let fw = ["close", "medium", "far"], sw = ["red", "orange", "green"];

    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) sensorp[i][j] = document.getElementById(`${fw[i]}-${sw[j]}-p`).value/100;
    }

    let getTmpBoard = () => {
        let tmpBoard = [];
        for(let i = 0; i < n; i++) {
            tmpBoard.push([]);
            for(let j = 0; j < m; j++) tmpBoard[i].push(0);
        }

        return tmpBoard;
    }

    let normalize = () => {
        let sump = 0;
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) sump += belief[i][j];
        }

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) belief[i][j] /= sump;
        }
    };

    let setTextTable = () => {
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++)
                document.getElementById(`cell-${i}-${j}`).textContent = (belief[i][j]*100).toFixed(2);
        }
    }

    let whichd = d => {
        console.assert(d >= 0);
        
        if(d <= near) return 0;
        if(d <= far) return 1;
        return 2;
    };

    let getDist = (i1, j1, i2, j2) => Math.abs(i1-i2)+Math.abs(j1-j2); 

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

    let timeButton = document.createElement("button");
    timeButton.id = "time-advance";
    timeButton.classList.add("game-button");
    timeButton.textContent = "Time+1";
    bcont.appendChild(timeButton);

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

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) document.getElementById(`cell-${i}-${j}`).className = ""; // May be will change
        }

        let tmpBoard = getTmpBoard();

        for(let i2 = 0; i2 < n; i2++) {
            for(let j2 = 0; j2 < m; j2++) {
                for(let k = 0; k < 9; k++) {
                    let i1 = i2+dirx[k], j1 = j2+diry[k];
                    if(isValidCell(i1, j1)) tmpBoard[i2][j2] += belief[i1][j1]*transp[i1][j1][i2][j2];
                }
            }
        }

        let sump = 0;
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < m; j++) {
                belief[i][j] = tmpBoard[i][j];
                sump += belief[i][j];
                document.getElementById(`cell-${i}-${j}`).textContent = (belief[i][j]*100).toFixed(2);
            }
        }

        console.assert(Math.abs(sump-1) < 0.0001, "Not normalized after time advancing");
    });

    let catchButton = document.createElement("button"), onCatch = false;
    catchButton.id = "catch";
    catchButton.classList.add("game-button");
    catchButton.textContent = "Catch";
    bcont.appendChild(catchButton);

    catchButton.addEventListener("click", () => {
        if(g == 0) return;
        cotg.textContent = "";

        onCatch = !onCatch;

        if(onCatch) catchButton.style.backgroundColor = "#eb867f";
        else catchButton.style.backgroundColor = "initial";
    });

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
            endg.textContent = "You have won but at what cost";
            return;
        }

        belief[x][y] = 0;

        normalize();
        setTextTable();
    }

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

let setBoard = document.getElementById("set-board");
setBoard.addEventListener("click", initialize);

initialize();