const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d')
const audio = document.getElementById('bgMusic');
canvas.width = 1000;
canvas.height = 600;
ctx.lineWidth = 3;
let ping = false;
let mouseShooting = false;

let explosions = [];
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerups = [];
let powerList = ['penta beam', 'nanobots', 'nanobots', 'nanobots', 'photon override', 'hyper light drifter', 'risk of rain',
                'guard skill: harmonics', 'adagio redshift', 'hack://corruption', 'guard skill: distortion',
                'cyber drive', 'scream', 'yatsufusa', 'ivories in the fire', 'guard skill: overdrive', 'l\'arc qui ne faut']
let title = true;
let shotsFired = 0;

let bg = new Image();
bg.src = 'assets/starfield.png'

let player = {
    x: 0,
    y: 500,
    vx: 0,
    vy: 0,
    speed: 5,
    hp: 100,
    damage: 1,
    maxHp: 100,
    src: 'assets/player.png',
    image: new Image(),
    rof: 3, //Rate of fire, in frame ticks
    shootDelay: 0,
    score: 0,
    width: 28,
    height: 21,
    ability: '',
    abilityCool: 0,
    draw: function(){
        ctx.drawImage(this.image, this.x, this.y);
        ctx.fillStyle = '#FF0000'; //Red
        ctx.fillRect(this.x, this.y - 5, this.width, 5);
        ctx.fillStyle = '#00FF00'; //Green
        ctx.fillRect(this.x, this.y - 5, Math.floor(this.width / this.maxHp * this.hp), 5);
    }
}

let keys = {}

player.image.src = player.src;

function start(){
    if(title){
        audio.play();
        for(let i = 0; i < 25; i++){
            spawnEnemy();
        }
        //localStorage.highScore works too, but be consistent.
        //setInterval takes two arguments: a function and a delay.
        //It will keep running the function every `delay` seconds.
        setInterval(function(){
            for(let i = 0; i < 8; i++){
                spawnEnemy();
            }
        }, 1500) //1s = 1000ms, so 1.5s = 1500ms
        setInterval(spawnPowerup, 4000) //4s = 4000ms
        setInterval(function(){
            spawnEnemy(true);
        }, 6000)
        //For the tutorial, put spawnEnemy in here as a lambda and eventually migrate it to a standalone function.
        title = false;
    }
}

document.getElementsByTagName('button')[0].addEventListener('click', function(){
    if(audio.paused) audio.play()
    else audio.pause()
}, false);

canvas.addEventListener('click', start, false);

canvas.addEventListener('mousedown', function() {
    mouseShooting = true;
}, false);

canvas.addEventListener('mouseup', function() {
    mouseShooting = false;
}, false);

window.onload = function(){
    if(!localStorage['highScore']) localStorage['highScore'] = 0;
    gameLoop();
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(player.ability === 'god tier: doki doki' && player.abilityCool <= 300){
        ctx.fillStyle = '#A00000';
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black';
        ctx.font = `${Math.floor(Math.random() * 30) + 20}px adventure`;
        ctx.fillText('Just Monika.', Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * (canvas.height - 64)) + 32);
    }else{
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

    if(title){
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", getRandomColor());
        gradient.addColorStop("0.5", getRandomColor());
        gradient.addColorStop("1.0", getRandomColor());
        ctx.font = '60px adventure';
        ctx.fillStyle = gradient; 
        ctx.fillText('Just Your Average', canvas.width / 2  - (ctx.measureText('Just Your Average').width / 2), 270);
        ctx.fillText('Space Invaders Clone', canvas.width / 2  - (ctx.measureText('Space Invaders Clone').width / 2), 310);
        ctx.fillStyle = '#ededed';
        ctx.font = '40px adventure';
        ctx.fillText('Click to start', canvas.width / 2  - (ctx.measureText('Click to start').width / 2), 350);
        ctx.fillText('Warning: Flashing Colors', canvas.width / 2  - (ctx.measureText('Warning: Flashing Colors').width / 2), 380);
        return;
    }
    if(player.ability === 'god tier: the fool\'s world'){
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 500 - player.abilityCool, 0, 2 * Math.PI, false);
        ctx.fillStyle = getRandomColor();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = getRandomColor();
        ctx.stroke();
    }
    //The order of the for loops matter. 
    //If you want to render the explosions ON TOP of the bullets, put the explosion loop AFTER the bullet loop.
    for(let e of explosions){
        e.render(ctx);
        if(e.i === 9){
            explosions.splice(explosions.indexOf(e), 1)
            e = null;
            delete e;    
        }
    }
    for(let b of bullets){
        b.render(ctx);
        for(let e of enemies){
            if(b.x > e.x && b.x < e.x + e.width && b.y < e.y + e.height && b.y > e.y){ //Check if the bullet is inside the width range of an enemy
                bullets.splice(bullets.indexOf(b), 1)
                b = null;
                delete b;
                e.hp -= player.damage;
                if(player.ability === 'adagio redshift' && player.hp < player.maxHp - 1) player.hp += 1;
                if(e.hp <= 0){ //Leave this as e.hp-- for the first part, point out that they are still alive with no hp, and change it to --e.hp
                    enemies.splice(enemies.indexOf(e), 1)
                    explode(e.x - 48, e.y - 48); //x - (explosion width / 2) + (enemy width / 2)
                    e = null;
                    delete e;
                    player.score += 5;
                }
                break;
            }
        }
        if(b && (b.y < 0 - b.image.height || b.x < 0 || b.x > canvas.width || b.y > canvas.height)){
            bullets.splice(bullets.indexOf(b), 1)
            b = null;
            delete b;
        }
    }
    for(let p of powerups){
        if(p.type === 'god tier: doki doki'){
            ctx.drawImage(Math.random > 0.5 ? player.image : bg, this.x, this.y, 20, 20);
        }
        p.render(ctx);
        if(player.x + player.width > p.x && player.x < p.x + 20 && player.y + player.height > p.y && player.y < p.y + 20){
            player.ability = p.type;
            player.abilityCool = p.type.includes('god tier') ? 400 : 200;
            powerups.splice(powerups.indexOf(p), 1)
            p = null;
            delete p;
        }
    }
    for(let e of enemies){
        e.render(ctx);
        if(--e.shoot <= 0){
            e.shoot = e.rof;
            let eb = new EnemyBullet(e.x, e.y);
            if(player.ability !== 'risk of rain'){
                eb.velX = (Math.floor(Math.random() * 2) - 1) * 2;
                e.rof = Math.floor(Math.random() * 100) + 100;
            }
            enemyBullets.push(eb);
        }
        if(e.y > canvas.height){
            enemies.splice(enemies.indexOf(e), 1)
            e = null;
            delete e;
        }
    }
    for(let eb of enemyBullets){
        eb.render(ctx);
        if(player.ability === 'god tier: incursio' && eb.y > player.y - player.height - 30){
            enemyBullets.splice(enemyBullets.indexOf(eb), 1)
            for(let i = -10; i < 11; i++){
                let bullet = new Bullet(eb.x, eb.y);
                bullet.image.src = 'assets/circle-bullet.png';
                bullet.velY = -6;
                bullet.velX = i / 5;
                bullets.push(bullet)
                shotsFired++;
            }
            eb = null;
            delete eb;
            continue;
        }
        if(player.ability === 'guard skill: distortion' && eb.x > player.x && eb.x < player.x + player.width && eb.y > player.y && eb.y < player.y + player.height){
            enemyBullets.splice(enemyBullets.indexOf(eb), 1)
            for(let i = -3; i < 4; i++){
                let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 5, player.y - 10);
                bullet.image.src = 'assets/circle-bullet.png';
                bullet.velY = -5;
                bullet.velX = i / 5;
                bullets.push(bullet)
                shotsFired++;
            }
            eb = null;
            delete eb;
            continue;
        }
        if(eb.x > player.x && eb.x < player.x + player.width && eb.y > player.y && eb.y < player.y + player.height){
            enemyBullets.splice(enemyBullets.indexOf(eb), 1)
            player.hp -= eb.damage;
            if(player.hp <= 0){
                if(player.score > localStorage['highScore']) localStorage['highScore'] = player.score
                player = null;
                delete player;
                location.reload();
                break;
            }
            eb = null;
            delete eb;
        }
        if(eb && (eb.y > canvas.height + eb.image.height || eb.y < 0)){
            enemyBullets.splice(enemyBullets.indexOf(eb), 1)
            eb = null;
            delete eb;
        }
    }
    if(player) player.draw();
    if(player.ability === 'guard skill: harmonics'){
        ctx.drawImage(player.image, player.x + player.width / 2 - 60, player.y + 10);
        ctx.drawImage(player.image, player.x + 60 - player.width / 2, player.y + 10);
    }
    if(player.ability === 'god tier: incursio'){
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(0, player.y - 30, canvas.width, 10)
    }
    if(player.ability === 'god tier: sonic rotation'){
        ctx.beginPath();
        ctx.strokeStyle = getRandomColor();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 25, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
    if(player.ability === 'guard skill: distortion'){
        ctx.beginPath();
        ctx.strokeStyle = '#56ff59';
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 21, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
    //GUI takes priority.
    ctx.fillStyle = 'white';
    ctx.font = '30px adventure'
    if(player.ability !== 'god tier: doki doki'){
        ctx.fillText(`Score: ${player.score}`, 10, 30);
        ctx.fillText(`Shots Fired: ${shotsFired}`, 15, 50);
        ctx.fillText(`High Score: ${localStorage['highScore']}`, 20, 70);
    }else{
        ctx.fillText(`${wtf(50)}: ${wtf(player.score)}`, 10, 30);
        ctx.fillText(`${wtf(110)}: ${wtf(shotsFired)}`, 15, 50);
        ctx.fillText(`${wtf(100)}: ${wtf(localStorage['highScore'])}`, 20, 70);
    }
    if(player.abilityCool > (player.ability.includes('god tier') ? 290 : 90)){
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        for(let i = 0; i < 1; i += 0.1){
            gradient.addColorStop('' + i, getRandomColor());
        }
        ctx.font = `${player.ability.includes('god tier') ? 55 : (player.ability.includes('guard skill') ? 60 : 80)}px adventure`;
        ctx.fillStyle = gradient;
        ctx.fillText(player.ability, canvas.width / 2 - (ctx.measureText(player.ability).width / 2), 280);
    }
    if((keys[32] || mouseShooting) && player.ability === 'god tier: doki doki'){
        for(let qwertyuiop = 0; qwertyuiop < 20; qwertyuiop++){
            let asdf = Math.random()
            if(asdf < 0.3){
                ctx.fillText(wtf(asdf * 100), Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * (canvas.height - 64)) + 32)
            }else if(asdf < 0.6){
                ctx.drawImage(player.image, Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * (canvas.height - 64)) + 32, Math.random() * 100, Math.random() * 100)
            }else{
                ctx.drawImage(bg, Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * (canvas.height - 64)) + 32, Math.random() * 100, Math.random() * 100)
            }
        }
    }
    //Don't use template literals in the tutorial
}

function wtf(m){
    let res = String.fromCharCode(Math.floor(Math.random() * m));
    for(let i = 0; i < ('' + m).length; i++){
        res += String.fromCharCode(Math.floor(Math.random() * m));
    }
    return res
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function explode(x, y){
    let explosion = new Explosion(x, y);
    explosions.push(explosion);
}

function spawnEnemy(boss = false){
    if(enemies.length > 90) return;
    let enemy = new Enemy(Math.floor(Math.random() * (canvas.width - 64)) + 32, (Math.floor(Math.random() * 4) + 1) * 50);
    if(boss){
        enemy.rof = 50;
        enemy.maxHp = enemy.hp = 30;
        enemies.push(enemy);
    }else{
        enemy.rof = Math.floor(Math.random() * 100) + 100;
        enemies.push(enemy);
    }
}

function spawnPowerup(){
    if(powerups.length > 7){ 
        powerups[0] = null;
        delete powerups[0];
        powerups = powerups.slice(1);
    }
    let powerName = powerList[Math.floor(Math.random() * powerList.length)];
    if(powerName.includes('god tier') && Math.random() > 0.5) powerName = powerList[Math.floor(Math.random() * powerList.length)];
    let powerup = new Powerup(Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * 200) + 300, powerName);
    powerups.push(powerup);
}

function shoot(){
    if(player.ability === 'penta beam'){
        for(let i = -2; i < 3; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 3, player.y - 10);
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'guard skill: overdrive'){
        for(let i = -10; i < 10; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 3, player.y - 10);
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'cyber drive'){
        for(let i = -5; i < 6; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 5, player.y - 10);
            bullet.image.src = 'assets/circle-bullet.png';
            bullet.velY = i !== 0 ? -Math.abs(i) : -5;
            bullet.velX = i / 3;
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'l\'arc qui ne faut'){
        for(let i = -1; i < 2; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 6, player.y - 10, enemies[Math.floor(Math.random() * enemies.length)]);
            bullet.image.src = 'assets/circle-bullet.png';
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'hyper light drifter'){
        let bullet = new Bullet(player.x + player.width / 2 - 3, player.y - 10);
        bullet.velY = -15;
        bullets.push(bullet)
    }else if(player.ability === 'god tier: lance of light'){
        for(let i = -50; i < 51; i++){
            let bullet = new Bullet(player.x + player.width / 2 + i * 3, player.y - 10);
            bullet.velY = -25;
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'god tier: adramelech'){
        for(let i = 5; i > 0; i--){
            for(let j = -5; j < 5; j++){
                let bullet = new Bullet(canvas.width - i * 200 - 360 + j * 10 + player.x - player.width, -20);
                bullet.velY = 20;
                bullets.push(bullet)
                shotsFired++;
            }
        }
        return;
    }else if(player.ability === 'god tier: a song of ice and fire'){
        for(let j = -30; j < 30; j++){
            let r = Math.random() > 0.5;
            let bullet = new Bullet(r ? 0 : canvas.width, Math.floor(Math.random() * player.y) - 100);
            bullet.image.src = Math.random() > 0.5 ? 'assets/circle-bullet.png' : 'assets/enemy-bullet.png';
            bullet.velY = 0;
            bullet.velX = r ? 10 : -10;
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'adagio redshift'){
        let bullet = new Bullet(player.x + player.width / 2 - 10, player.y - 10);
        let bullet2 = new Bullet(player.x + player.width / 2 + 10, player.y - 10);
        bullets.push(bullet)
        bullets.push(bullet2)
        shotsFired += 2;
    }else if(player.ability === 'scream'){
        for(let i = -10; i < 11; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 5) - 5, player.y - 10);
            bullet.image.src = 'assets/circle-bullet.png';
            bullet.velY = -Math.abs(5 / i) - 1;
            bullet.velX = i / 5;
            bullets.push(bullet)
            shotsFired++;
        }
        let bullet = new Bullet(player.x + player.width / 2 - 3, player.y - 10);
        bullets.push(bullet)
    }else if(player.ability === 'yatsufusa'){
        for(let i = -2; i < 2; i++){
            let bullet = new Bullet(player.x + player.width / 2 + (i * 50), canvas.height);
            bullet.image.src = 'assets/enemySingle.png';
            bullet.velY = -5;
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'ivories in the fire'){
        let bullet = new Bullet(player.x + player.width / 2 - 26, player.y - 10);
        let bullet2 = new Bullet(player.x + player.width / 2 + 20, player.y - 10);
        bullets.push(bullet)
        bullets.push(bullet2)
        shotsFired += 2;
    }else if(player.ability === 'guard skill: harmonics'){
        let bullet = new Bullet(player.x + player.width - 63, player.y);
        let bullet2 = new Bullet(player.x + player.width / 2 - 3, player.y - 10);
        let bullet3 = new Bullet(player.x + 57, player.y);
        bullets.push(bullet)
        bullets.push(bullet2)
        bullets.push(bullet3)
        shotsFired += 3;
    }else if(player.ability === 'god tier: sonic rotation'){
        for(let i = -2; i < 2; i++){
            let bullet = new Bullet(player.x + player.width / 2 - 3, player.y - 10);
            bullet.velX = Math.floor(Math.random() * 50) - 25;
            bullet.velY = Math.floor(Math.random() * -1) - 10;
            bullet.image.src = Math.random() > 0.5 ? 'assets/circle-bullet.png' : 'assets/bullet.png';
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else if(player.ability === 'god tier: doki doki'){
        for(let i = -50; i < 50; i++){
            let bullet = new Bullet(Math.floor(Math.random() * (canvas.width - 64)) + 32, Math.floor(Math.random() * (canvas.height - 64)) + 32);
            let m = Math.random()
            bullet.velX = (m > 0 ? (m + 5) : (m - 5)) * (Math.random() > 0.5 ? -8 : 8);
            bullet.velY = (m > 0 ? (m + 5) : (m - 5)) * (Math.random() > 0.5 ? -8 : 8);
            bullet.image.src = 'assets/red.png';
            bullets.push(bullet)
            shotsFired++;
        }
        return;
    }else{
        let bullet = new Bullet(player.x + player.width / 2 - 3, player.y - 10);
        bullets.push(bullet)
    }
    shotsFired++;
}

window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true; //The player is pressing the button represented by e.keyCode (see below)
});

window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false; //The player has stopped pressing the button represented by e.keyCode (see below)
});

/*
================
KEYCODES
37 = Left
38 = Up
39 = Right
40 = Down
32 = Space
================
*/


function gameLoop(){

    if(title){
        draw();
        requestAnimationFrame(gameLoop); //Requests an animation frame?
        return;
    }

    //b o  i   l    e     r

    if(player.score >= 5000 && !powerList.includes('god tier: sonic rotation')){
        powerList.push('god tier: sonic rotation');
        player.ability = 'god tier: sonic rotation';
        player.abilityCool = 400;
    }
    if(player.score >= 10000 && !powerList.includes('god tier: lance of light')){
        powerList.push('god tier: lance of light');
        player.ability = 'god tier: lance of light';
        player.abilityCool = 400;
    }
    if(player.score >= 15000 && !powerList.includes('god tier: disintegrate')){
        powerList.push('god tier: disintegrate');
        player.ability = 'god tier: disintegrate';
        player.abilityCool = 400;
    }
    if(player.score >= 20000 && !powerList.includes('god tier: incursio')){
        powerList.push('god tier: incursio');
        player.ability = 'god tier: incursio';
        player.abilityCool = 400;
    }
    if(player.score >= 25000 && !powerList.includes('god tier: adramelech')){
        powerList.push('god tier: adramelech');
        player.ability = 'god tier: adramelech';
        player.abilityCool = 400;
    }
    if(player.score >= 30000 && !powerList.includes('god tier: a song of ice and fire')){
        powerList.push('god tier: a song of ice and fire');
        player.ability = 'god tier: a song of ice and fire';
        player.abilityCool = 400;
    }
    if(player.score >= 35000 && !powerList.includes('god tier: the fool\'s world')){
        powerList.push('god tier: the fool\'s world');
        player.ability = 'god tier: the fool\'s world';
        player.abilityCool = 400;
    }
    if(player.score >= 40000 && !powerList.includes('god tier: doki doki')){
        powerList.push('god tier: doki doki');
        player.ability = 'god tier: doki doki';
        player.abilityCool = 400;
    }

    if(keys[16] && !['hyper light drifter', 'god tier: disintegrate'].includes(player.ability)) player.speed = 3;
    else if(!keys[16] && !['hyper light drifter', 'god tier: disintegrate'].includes(player.ability)) player.speed = 5;

    //Because of this, the left key (which has a key code of 37) takes priority over the else if (right arrow key with code 39)
    if((keys[37] || keys[65]) && player.x > 0) player.vx = -player.speed; //Negative x velocity means the player will move left 
    else if((keys[39] || keys[68]) && player.x < canvas.width - player.width) player.vx = player.speed; //Positive x velocity means the player will move right
    else player.vx = 0; //Don't move at all
    
    if((keys[38] || keys[87]) && player.y > 300) player.vy = -player.speed; //Negative y velocity means the player will move up 
    else if((keys[40] || keys[83]) && player.y < canvas.height - 20) player.vy = player.speed; //Positive y velocity means the player will move down
    else player.vy = 0; //Don't move at all

    if(player.abilityCool > 0){ 
        player.abilityCool--;
        switch(player.ability){
            case 'nanobots':
                player.hp += player.hp < player.maxHp ? 0.5 : 0;
                break;
            case 'photon override':
                for(let e of enemies){
                    e.shoot = 100;
                }
                player.shootDelay = 0;
                break;
            case 'hyper light drifter':
                player.rof = 2;
                player.damage = 5;
                player.speed = 10;
                break;
            case 'god tier: lance of light':
                player.rof = 0;
                player.damage = 5;
                break;
            case 'risk of rain':
                for(let b of enemyBullets){
                    b.velY = -5;
                    for(let e of enemies){
                        if(b.x > e.x && b.x < e.x + e.width && b.y < e.y + e.height && b.y > e.y){ //Check if the bullet is inside the width range of an enemy
                            enemyBullets.splice(enemyBullets.indexOf(b), 1)
                            b = null;
                            delete b;
                            e.hp -= player.damage;
                            if(e.hp <= 0){ //Leave this as e.hp-- for the first part, point out that they are still alive with no hp, and change it to --e.hp
                                enemies.splice(enemies.indexOf(e), 1)
                                explode(e.x - 48, e.y - 48); //x - (explosion width / 2) + (enemy width / 2)
                                e = null;
                                delete e;
                                player.score += 5;
                            }
                            break;
                        }
                        e.rof = 5;
                    }
                }
                break;
            case 'adagio redshift':
                for(let e of enemies){
                    e.speed = 0;
                }
                break;
            case 'god tier: the fool\'s world':
                for(let e of enemies){
                    e.speed = 0;
                    e.rof = 1;
                    e.x += (player.x - e.x) / 20;
                    e.y += (player.y - e.y) / 20;
                    let deltaX = player.x - e.x;
                    let deltaY = player.y - e.y;
                    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    if(distance < Math.floor(Math.random() * (500 - player.abilityCool)) + 100) e.hp -= 2;
                    if(e.hp <= 0){ //Leave this as e.hp-- for the first part, point out that they are still alive with no hp, and change it to --e.hp
                        enemies.splice(enemies.indexOf(e), 1)
                        explode(e.x - 48, e.y - 48); //x - (explosion width / 2) + (enemy width / 2)
                        e = null;
                        delete e;
                        player.score += 5;
                        continue;
                    }
                }
                break;
            case 'hack://corruption':
                for(let b of enemyBullets){
                    b.velX = 5;
                    b.velY = 0;
                    for(let e of enemies){
                        if(b.x > e.x && b.x < e.x + e.width && b.y < e.y + e.height && b.y > e.y){ //Check if the bullet is inside the range of an enemy
                            enemyBullets.splice(enemyBullets.indexOf(b), 1)
                            b = null;
                            delete b;
                            e.hp -= player.damage;
                            if(e.hp <= 0){
                                enemies.splice(enemies.indexOf(e), 1)
                                explode(e.x - 48, e.y - 48); //x - (explosion width / 2) + (enemy width / 2)
                                e = null;
                                delete e;
                                player.score += 5;
                            }
                            break;
                        }
                        e.rof = 40;
                    }
                }
                break;
            case 'scream':
                player.rof = 6;
                break;
            case 'cyber drive':
                player.rof = 4;
                break;
            case 'god tier: sonic rotation':
                player.rof = 1;
                player.damage = 2;
                break;
            case 'guard skill: distortion':
                player.hp += player.hp < player.maxHp ? 0.1 : 0;
                player.rof = 20
                break;
            case 'guard skill: overdrive':
                player.damage = 0.3;
                break;
            case 'god tier: adramelech':
                player.shootDelay = 0;
                break;
            case 'god tier: disintegrate':
                player.speed = 4;
                for(let e of enemies){
                    e.hp -= 0.1;
                    if(e.hp <= 0){
                        enemies.splice(enemies.indexOf(e), 1)
                        explode(e.x - 48, e.y - 48);
                        e = null;
                        delete e;
                        player.score += 5;
                        continue;
                    }
                    e.rof = 1;
                }
                break;
            case 'ivories in the fire':
                for(let b of bullets){
                    if(ping){
                        b.velX--;    
                    }else{
                        b.velX++;
                    }
                    if(b.velX < -5 || b.velX > 5){
                        ping = !ping;
                    }
                }
                player.rof = 1;
                break;
        }
    }
    else player.ability = '';

    if(!['hyper light drifter', 'god tier: lance of light', 'scream', 'photon override', 'cyber drive', 'guard skill: distortion', 
        'guard skill: overdrive', 'ivories in the fire', 'god tier: sonic rotation'].includes(player.ability)){
        player.rof = 3;
        player.damage = 1;
    }
    if(!['risk of rain', 'hack://corruption'].includes(player.ability)){
        for(let e of enemies){
            e.rof = 100;
        }
        for(let b of enemyBullets){
            //b.velX = 0;
            b.velY = 5;
        }
    }
    if(player.ability !== 'adagio redshift'){
        for(let e of enemies){
            e.speed = e.speed > 0 ? 1 : -1;
        }
    }
        

    if((keys[32] || mouseShooting) && player.shootDelay <= 0){ //If the player presses space and the gun's cooldown has been reached, shoot.
        shoot();
        player.shootDelay = player.rof; //Reset the shooting delay
    }

    if(player.shootDelay > 0) player.shootDelay--; //Subtracts 1 from player.shootDelay. Equivalent to player.shootDelay = player.shootDelay - 1.

    if(keys[190]) spawnEnemy();

    player.y += player.vy;
    player.x += player.vx; //Move the player depending on the velocity (see above).

    draw(); //This is where everything is actually drawn. Without this, the canvas would be blank.
    requestAnimationFrame(gameLoop); //Requests an animation frame?
}

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
