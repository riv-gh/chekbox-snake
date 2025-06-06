const gameToHtmlObj = {
    'free': '<input type="checkbox" />',
    'apple': '<input type="checkbox" checked="checked" disabled="disabled" />',
    'player': '<input type="checkbox" checked="checked" />',
}
const directionObj = {
    'up': {x: 0, y: -1},
    'left': {x: -1, y: 0},
    'down': {x: 0, y: 1},
    'right': {x: 1, y: 0},
}


const container = document.getElementById('game');
const scoreEl = document.getElementById('score');
class Game {
    constructor(container, width, height, socreEl=null, noWals=false, timoiut=500) {
        this.timoiut = timoiut;
        this.gameInterval = {};
        this.scoreEl = socreEl;
        this.noWals = noWals;
        this.score = 0;
        this.container = container;
        this.width = width;
        this.height = height;
        this.apple = { x: 8, y: 8 };
        this.player = {
            direction: 'right',
            nextDirection: 'right',
            body: [
                { x: 2, y: 3 },
                { x: 1, y: 3 },
            ],
        };
        this.player.addTail = () => {
            console.log(this.player.body[0])
            const { x, y } = this.player.body[0]
            console.log(x, y)
            this.player.body.push({x, y});
        };

        this.player.nextMove = () => {
            this.player.direction = this.player.nextDirection;
            const nextX = this.player.body[0].x + directionObj[this.player.direction].x;
            const nextY = this.player.body[0].y + directionObj[this.player.direction].y;
            for(let i=this.player.body.length-1; i>0; i--) {
                this.player.body[i].x = this.player.body[i-1].x;
                this.player.body[i].y = this.player.body[i-1].y;
            }
            if(this.player.body.find(bodyPart=>(bodyPart.x===nextX && bodyPart.y===nextY))) {
                this.gameOver();
            }
            this.player.body[0] = {
                x: nextX,
                y: nextY,
            }

            if (this.player.body[0].x<0) {
                this.noWals ? this.player.body[0].x = this.width-1 : this.gameOver();
            }
            if (this.player.body[0].y<0) {
                this.noWals ? this.player.body[0].y = this.height-1 : this.gameOver();
            }
            if (this.player.body[0].x>=this.width) {
                this.noWals ? this.player.body[0].x = 0 : this.gameOver();
            }
            if (this.player.body[0].y>=this.height) {
                this.noWals ? this.player.body[0].y = 0 : this.gameOver();
            }
            
        };

        this.gameMap = (new Array(this.height)).fill(0).map(()=>(new Array(this.width).fill('free')));
    } 
    createApple = () => {
        let aX, aY;
        do {
            aX = Math.trunc(Math.random() * this.width);
            aY = Math.trunc(Math.random() * this.height);
        } while (
            this.gameMap[aY][aX]!=='free'
        )
        this.apple.x = aX;
        this.apple.y = aY;
    }
    nextState() {
        this.player.nextMove();
        const pX = this.player.body[0].x;
        const pY = this.player.body[0].y;
        const nextPoint = this.gameMap[pY][pX];
        switch (nextPoint) {
            case 'apple':
                this.createApple();
                this.score = this.score + 1;
                this.player.addTail();
            case 'free':
                this.player.body.forEach(bodyPart=>{
                    this.gameMap[bodyPart.y][bodyPart.x] = 'player';
                });
            break;
        }
        this.player.body.forEach(bodyPart=>{
            this.gameMap[bodyPart.y][bodyPart.x] = 'player';
        });
    }
    getMap() {
        return this.gameMap;
    }
    clear() {
        this.gameMap = (new Array(this.height)).fill(0).map(()=>(new Array(this.width).fill('free')));
    }
    render() {
        this.gameMap = (new Array(this.height)).fill(0).map(()=>(new Array(this.width).fill('free')));
        this.gameMap[this.apple.y][this.apple.x] = 'apple'
        this.player.body.forEach(bodyPart=>{
            this.gameMap[bodyPart.y][bodyPart.x] = 'player';
        });
    }
    draw() {
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        this.render();
        this.container.innerHTML = '';
        this.gameMap.map(lineArr=>{
            const htmlLine = document.createElement('div');
            htmlLine.innerHTML = lineArr.map(cel=>gameToHtmlObj[cel]).join('');
            this.container.appendChild(htmlLine)
        });
    }
    playerMove(direction) {
        if (
            (Math.abs(directionObj[direction].x) === Math.abs(directionObj[this.player.direction].x)) &&
            (Math.abs(directionObj[direction].y) === Math.abs(directionObj[this.player.direction].y))
        )
            return console.log('wrong direction!');

        this.player.nextDirection = direction;
    }
    start() {
        this.gameInterval = setInterval(()=>{
            game.nextState();
            game.draw();
        }, this.timoiut)
    }
    pause() {
         clearInterval(this.gameInterval)
    }
    gameOver() {
        this.pause();
        alert(`game over: ${this.score}`);
        location.reload();
    }
}
const game = new Game(container, 10, 10, scoreEl, false, 200);
game.draw();
document.addEventListener('keydown', (event) => {
    if (event.code.indexOf('Arrow') === 0) {
        game.playerMove(event.code.replace('Arrow','').toLowerCase());
    }
});
document.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName !== 'BUTTON') {
        return;
    }
    const action = event.target.dataset['action'];
    switch(action) {
        case 'start':
            game.start();
            break;
        case 'pause':
            game.pause();
            break;

        default:
            console.warn(`undefinded atcion: ${action}`);

    }
})