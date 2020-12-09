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
let belief;
let ghostsx, ghostsy;
let dirx = [-1, 1, 0, 0, -1, 1, 1, -1, 0];
let diry = [0, 0, -1, 1, -1, -1, 1, 1, 0];
let movep, transp;

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

    console.log(transp[0][0][0][1]);

    let timeButton = document.createElement("button");
    timeButton.id = "time-advance";
    timeButton.classList.add("game-button");
    timeButton.textContent = "Time+1";
    bcont.appendChild(timeButton);

    timeButton.addEventListener("click", () => {
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

        //console.log(ghostsx);
        //console.log(ghostsy);

        let tmpBoard = [];
        for(let i = 0; i < n; i++) {
            tmpBoard.push([]);
            for(let j = 0; j < m; j++) tmpBoard[i].push(0);
        }

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
        onCatch = !onCatch;

        if(onCatch) catchButton.style.backgroundColor = "#eb867f";
        else catchButton.style.backgroundColor = "initial";
    });

    let handleCatch = (i, j) => {
        console.log(`Tried to catch in (${i}, ${j})`);
    }

    let handleSensor = (i, j) => {
        console.log(`Tried to sense in (${i}, ${j})`);
    }

    for(let i = 0; i < n; i++) {
        for(let j = 0; j < m; j++) {
            document.getElementById(`cell-${i}-${j}`).addEventListener("click", e => {
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