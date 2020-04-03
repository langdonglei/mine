function Mine(rowNumber, columnNumber, mineNumber) {
    document.oncontextmenu = function () {
        return false;
    };
    document.onselectstart = function () {
        return false;
    };
    this.rowNumber = rowNumber;
    this.columnNumber = columnNumber;
    this.mineNumber = mineNumber;
    this.mine = this.buildDataOfMine();
    this.map = this.buildDataOfMap();
    this.updateData();
    this.createTable();
    document.querySelector('.label strong').innerText = this.mineNumber;
}

Mine.prototype.buildDataOfMine = function () {
    let arr = new Array(this.rowNumber * this.columnNumber);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    arr.sort(function () {
        return Math.random() - 0.5
    });
    return arr.slice(0, this.mineNumber);
};

Mine.prototype.buildDataOfMap = function () {
    let arr = [];
    let index = 0;
    for (let i = 0; i < this.rowNumber; i++) {
        arr[i] = [];
        for (let j = 0; j < this.columnNumber; j++) {
            if (-1 === this.mine.indexOf(index++)) {
                arr[i][j] = {type: 'number', x: j, y: i, value: 0};
            } else {
                arr[i][j] = {type: 'mine', x: j, y: i};
            }
        }
    }
    return arr;
};

Mine.prototype.getAround = function (cell) {
    let x = cell.x;
    let y = cell.y;
    let arr = [];
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 ||
                j < 0 ||
                i > this.rowNumber - 1 ||
                j > this.columnNumber - 1 ||
                (i === x && j === y) ||
                this.map[j][i].type === 'mine'
            ) {
                continue;
            }
            arr.push([j, i]);
        }
    }
    return arr;
};

Mine.prototype.updateData = function () {
    for (let i = 0; i < this.rowNumber; i++) {
        for (let j = 0; j < this.columnNumber; j++) {
            let cell = this.map[i][j];
            if ('mine' === cell.type) {
                this.getAround(cell).forEach((v) => {
                    this.map[v[0]][v[1]].value++;
                });
            }
        }
    }
};

Mine.prototype.createTable = function () {
    let table = document.createElement('table');
    for (let i = 0; i < this.rowNumber; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < this.columnNumber; j++) {
            this.map[i][j].dom = document.createElement('td');
            this.map[i][j].dom.setAttribute('x', i.toString());
            this.map[i][j].dom.setAttribute('y', j.toString());
            this.map[i][j].dom.onmouseup = (event) => {
                // 左键
                if (0 === event.button && 'flag' !== this.map[i][j].dom.className) {
                    // 雷
                    if ('mine' === this.map[i][j].type) {
                        this.gameOver(this.map[i][j].dom);
                    }
                    // 数字
                    else if ('number' === this.map[i][j].type) {
                        // todo 能不能把that省略 扩撒的时候没有考虑到已经被插旗的格子
                        let that = this;
                        !function zero(cell) {
                            if (!cell.dom.check && 0 === cell.value) {
                                cell.dom.check = true;
                                cell.dom.innerHTML = '';
                                cell.dom.className = 'c0';
                                that.getAround(cell).forEach((v) => {
                                    zero(that.map[v[0]][v[1]]);
                                })
                            } else {
                                if (0 !== cell.value) {
                                    cell.dom.innerText = cell.value;
                                }
                                cell.dom.className = 'c' + cell.value;
                            }
                        }(this.map[i][j]);
                    }
                }
                // 右键
                else if (2 === event.button) {
                    if (this.map[i][j].dom.className && 'flag' !== this.map[i][j].dom.className) {
                        return;
                    }
                    if ('flag' === this.map[i][j].dom.className) {
                        this.mineNumber++;
                        this.map[i][j].dom.className = '';
                    } else {
                        this.mineNumber--;
                        this.map[i][j].dom.className = 'flag';
                    }
                    document.querySelector('.label strong').innerText = this.mineNumber;
                    this.isWin();
                }
            };
            row.appendChild(this.map[i][j].dom);
        }
        table.appendChild(row);
    }
    document.querySelector('.content').innerHTML = '';
    document.querySelector('.content').appendChild(table);
};
Mine.prototype.gameOver = function (dom) {
    // todo 有些数字不显示
    for (let i = 0; i < this.rowNumber; i++) {
        for (let j = 0; j < this.columnNumber; j++) {
            let cell = this.map[i][j];
            cell.dom.onmouseup = null;
            if ('mine' === cell.type) {
                if ('flag' === cell.dom.className) {
                    cell.dom.style.backgroundColor = '#42ff5d'
                }
                cell.dom.className = 'mine';
            } else {
                cell.innerText = cell.value;
                cell.dom.className = 'c' + cell.value;
                if (0 === cell.value) {
                    cell.dom.innerText = '+';
                }
            }
        }
    }
    if (dom) {
        dom.style.backgroundColor = '#ff313d';
    }
};
Mine.prototype.isWin = function () {
    if (0 === this.mineNumber) {
        document.querySelectorAll('.flag').forEach((v) => {
            let x = parseInt(v.getAttribute('x'));
            let y = parseInt(v.getAttribute('y'));
            if ('mine' !== this.map[x][y].type) {
                return;
            }
        });
        alert('胜利');
        this.gameOver();
    }
};

let arr = [[3, 3, 3], [9, 9, 9], [18, 18, 18]];
let btns = document.getElementsByTagName('button');
for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {
        this.className = 'active';
        new Mine(...arr[i]);
    }
}
btns[0].click();
