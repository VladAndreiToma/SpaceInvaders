// laser class a super weapon with the property of cutting thorugh multiple enemies
class Laser{
    // in constructor send a pointer to the game itself
    constructor( game ){
        // pasing context
        this.game = game;
        this.x = 0;     this.y = 0;
        this.height = this.game.height - 50;       this.width;
    }
    render( context ){
        this.x = this.game.player.x + this.game.player.width*0.5 - this.width*0.5 ;
        this.game.player.energy -= this.damage;

        context.save();
        context.fillStyle = 'gold';
        context.fillRect( this.x , this.y , this.width , this.height );
        context.fillStyle = 'white';
        context.fillRect( this.x + this.width * 0.2 , this.y , this.width * 0.6 , this.height );
        context.restore();

        if( this.game.spriteUpdate ){
            this.game.waves.forEach( wave => {
                wave.enemies.forEach( enemy => {
                   if( this.game.checkCollision( enemy , this) ){
                        enemy.hit( this.damage ); 
                    } 
                } )
            })
            this.game.bossArray.forEach( boss =>{
                if( this.game.checkCollision( boss , this ) && boss.y >= 0 ){
                    boss.hit( this.damage );
                }
            } )
        }
    }
}
// mini laser version
class SmallLaser extends Laser{
    // pass game reference
    constructor( game ){
        // overwriting with custom properties
        super( game );
        this.width = 5;
        this.damage = 0.3; // smaller but continuous
    }
    render( context ){
        if( this.game.player.energy > 1 && !this.game.player.cooldown ){
            this.game.player.frameX = 2;
            super.render( context );
        }
    }
}

// maxi laser version
class BigLaser extends Laser{
    constructor( game ){
        super( game );
        this.width = 25;
        this.damage = 0.8;
    }
    render( context ){
        if( this.game.player.energy > 1 && !this.game.player.cooldown ){
            this.game.player.frameX = 3;
            super.render(  context );
        }
    }
}


// projectile is the shooting tool.
// it belongs to player's arsenal and its in "PLAYER STYLING CONCEPT"
class Projectile{
    constructor(){
        this.width = 10; 
        this.height = 20;
        this.x = 0;
        this.y = 0;
        this.speed = 20;
        this.free = true;
    }
    draw( context ){
        if( !this.free  ){
            context.save();
            context.fillStyle = 'gold';
            context.fillRect( this.x , this.y , this.width , this.height );
            context.restore();
        }
    }
    update(){
        if( !this.free ){
            this.y -= this.speed;
            if( this.y < -this.height )   this.reset();
        }
    }
    start( x , y ){
        this.free = false;
        this.x = x - this.width/2;      this.y = y;
    }
    reset(){
        this.free = true;
    }
}


class Enemy{
    constructor( game , positionX , positionY){
        // i have to send a reference to the game object
        this.game = game;
        this.width = this . game . enemySize;
        this.height = this . game . enemySize;
        this.x = 0; 
        this.y = 0;
        this.positionX = positionX;
        this.positionY = positionY;
        this.markedForDeletion = false;
    }
    draw( context ){
        //context.strokeRect( this.x , this.y , this.width , this.height ); 
        context.drawImage( this.image , this.frameX * this.width , this.frameY * this.height,
            this.width , this.height , 
            this.x , this.y , this.width , this.height );
    }
    update(x,y){
        this.x = x + this.positionX;
        this.y = y + this.positionY;
        // collision checkings
        this.game.projectilesPool.forEach( projectile => {
            if( !projectile.free && this.game.checkCollision( this , projectile ) 
                && this.lives >= 1 ) // enemy and projectile for each enemy
            {
                this.hit( 1 );
                projectile.reset();
            }        
        } );
        if( this.lives < 1 ){
            if( this.game.spriteUpdate )    this.frameX++;
            if( this.frameX > this.maxFrame ){
                this.markedForDeletion = true; // destroy by animation frame switch
                if( !this.game.gameOver ) this.game.score += this.maxLives; // better enemies better scores if killed
            }
        }
        // lose conidtional logic
        // checking collisions with player. Enemy - player collisions
        if( this . game . checkCollision( this , this.game.player ) && this.lives >= 1){
            this.lives = 0;
            this.game.player.lives--;  // see here you reduce with 1 or with all life of the oponent the lives of the spaceship
        }
        // the height must exceed the player
        if( this . y + this . height > this . game . height || this.game.player.lives < 1){
            this.game.gameOver = true;
            console . log( "gameOver state: " , this.game.gameOver );
            this.markedForDeletion = true;
        }
    }
    hit( damage ){
        this.lives -= damage;
    }
}

// introducing the first oponent  ---- BeetleMorph
class Beetlemorph extends Enemy{
    constructor( game , positionX , positionY ){
        super( game , positionX , positionY ); // i need to make sure i m super so i can overwrite functionalities of parent
        this.image = document . getElementById( 'beetlemorph' );
        // transitions between pictures we use the pixels from the png of beetlemorph
        this.frameX = 0;
        this.frameY = Math.floor(Math.random()*4);
        //lives of beetlemorph
        this.lives = 1;
        this.maxFrame = 2;
        this.maxLives = this.lives;
    }
}
// introducing the second enemy ------ Rhinomorph ---- he has shields
class Rhinomorph extends Enemy{
    constructor( game , positionX , positionY ){
        super( game , positionX , positionY );  // allows to overwrite
            this.image = document . getElementById( 'rhinomorph' );
            this.frameX = 0;
            this.maxFrame = 5;
            this.frameY = Math .floor( Math . random() * 4 );
            this.lives = 4 ;
            this.maxLives = this.lives;
    }
    hit( damage ){
        this.lives -= damage;
        this.frameX = Math.floor(this.maxLives - this.lives);
    }
}


class Boss{
    // boss is unique so it doesnt extend anything
    constructor( game , bossLives ){
        // sending a game ref
        this.game = game;
        this.width = 200;
        this.height = 200;
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = -this.height;
        this.speedX = Math.random() < 0.5 ? -1 : 1;
        this.speedY = 0; // moves on x axis randomly
        this.lives = bossLives;
        this.maxLives = this.lives;
        this.markedForDeletion = false;
        this.image = document.getElementById( 'boss' ); 
        this.frameX = 0;
        this.frameY = Math.floor(  Math.random() * 4 );
        this.maxFrame = 11;
    }
    // since it does not extend enemy class i have to put own drawing updates and hits
    draw( context ){
        context . drawImage( this.image , this.frameX * this.width , this.frameY * this.height , this.width ,
            this.height , this.x , this.y , this.width , this.height );
        if( this.lives>0 ){
            context.save();
            context.textAlign = 'center';
            context.shadowOffsetX = 3;          context.shadowOffsetY = 3;          context . shadowColor = 'black';
            context.fillText( Math.floor(this.lives) , this.x + this.width * 0.5 , this.y+50 );
            context.restore(); 
        }
    }
    update(){
        this.speedY = 0;
        if( this.game.spriteUpdate && this.lives >= 1 ) this.frameX = 0;
        if( this.y <= 0 ) this.y += 4; // move the y index
        if( this.x < 0 || this.x > this.game.width - this.width && this.lives ){
            this.speedX *= -1;
            this.speedY += this.height * 0.5; 
        }
        this.x += this.speedX;
        this.y += this.speedY;

        // customized collision logic with the projectiles basically i m deciding whats happening on collision with projectiles
        this.game.projectilesPool.forEach( projectile => {
            if( this.game.checkCollision( this , projectile ) && !projectile.free && this.lives >= 1 && this . y >= 0 ){
                this.hit(1);
                projectile.reset();
            }
        } )

        // what happens at the collision between the boss and the player
        if( this.game.checkCollision(this , this.game.player) && this.lives >= 1 ){
            this.game.gameOver = true;
            this.lives = 0;
        }

        // conditions if you destroy a boss
        if( this.lives < 1 && this.game.spriteUpdate ){
            this.frameX++;
            if(this.frameX > this.maxFrame){
                this.markedForDeletion = true;
                this.game.score += this.maxLives;
                this.game.bossLives += 5;
                if( !this.game.gameOver ) this.game.newWave();
            }
        }
        if( this.y + this.height > this.game.height )
            this.game.gameOver = true;
    }
    hit( damage ){
        this.lives -= damage;
        if( this. lives > 0 ){
            this.frameX = 1;
        }
    }
}

// the wave of enemies class - it creates the next round
class Wave{
    constructor( game ){
        this.game = game;
        this.width = this.game.columns * this.game.enemySize;
        this.height = this.game.rows * this.game.enemySize;
        this.x = this.game.width/2 - this.width/2;
        this.y = - this . height;
        this.speedX = Math.random() < 0.5 ? -1:1;
        this.speedY = 0;
        this.enemies = [];
        this.nextWaveTrigger = false;
        this.markedForDeletion = false;
        this.create();
    }
    render(context) {
            if (this.y < 0) this.y += 5;
            this.speedY = 0;
    
            // Draw the wave's bounding rectangle (mainframe)
            //context.strokeRect(this.x, this.y, this.width, this.height);
    
            // Reverse direction and move down if hitting canvas edges
            if (this.x < 0 || this.x > this.game.width - this.width) {
                this.speedX *= -1;
                this.speedY += this.game.enemySize;
            }
            this.x += this.speedX;
            this.y += this.speedY;
    
            // Update and draw each enethis.game.scoy
            this.enemies.forEach(enemy => {
                enemy.update(this.x, this.y);
                enemy.draw(context);
            });
    
            // Remove enemies marked for deletion
            this.enemies = this.enemies.filter(object => !object.markedForDeletion);
            if( this.enemies.length <= 0 ) this.markedForDeletion = true;
    }
    create(){
        for( let y = 0 ; y < this . game . rows ; y++ ){
            for( let x = 0 ; x < this . game . columns ; x++ ){
                let enemyX = x * this . game . enemySize;
                let enemyY = y * this . game . enemySize;
                if( Math.random() < 0.5 ){
                    this.enemies.push( new Rhinomorph( this.game , enemyX , enemyY ) )
                }else{
                    this.enemies.push( new Beetlemorph( this.game , enemyX , enemyY ) );
                }
            }
        }
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 140;
        this.height = 140;
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = this.game.height - this.height;
        this.speed = 10;

        this.lives = 3;
        this.maxLives = 10;
        
        this.cockpit_image = document . getElementById( 'player' );
        
        this.jets_image = document . getElementById( 'player_jets' );
        
        this.frameX = 0;
        this.jetsFrameX = 1;

        this.bigLaser = new BigLaser( this.game );
        this.smallLaser = new SmallLaser( this.game );
        this.energy = 50;
        this.maxEnergy = 100;
        this.cooldown = false;
    }

    draw(context) {
         // Set fill color for the rectangle
        //context.fillRect(this.x, this.y, this.width, this.height);
        if( this.game.keys.indexOf( ' ' ) > -1 ){
            this.frameX = 1;  // making player seem to shoot animation by connecting it to firing key which is space
        }else if( this.game.keys.indexOf( 'g' ) > -1 ){
            // this.frameX = 2;
            this.smallLaser.render( context );
        } else if( this.game.keys.indexOf( 'b' ) > -1 ){
            // this.frameX = 3;
            this.bigLaser.render( context );
        }
        else{
            this.frameX = 0;
        }
        context.drawImage( this.cockpit_image , this.frameX * this.width , 0 , this.width ,
            this.height , this.x , this.y , this.width , this.height );
        context.drawImage(  this.jets_image , this.jetsFrameX * this.width , 0 , this.width ,
            this.height , this.x , this.y , this.width , this.height );
    } 

    update(){

        // energy
        if( this.energy < this.maxEnergy ) this.energy += 0.05;
        if( this.energy < 1 ) this . cooldown = true;
        else if( this.energy > this.maxEnergy * 0.2 )   this.cooldown = false;

        // movement control
        if( this . game . keys . indexOf( 'ArrowLeft' ) > -1 ){ 
            this.x -= this.speed;
            this.jetsFrameX = 0;
        }else if( this . game . keys . indexOf( 'ArrowRight' ) > -1 ){
            this.x += this.speed;
            this.jetsFrameX = 2;
        }else{
            this.jetsFrameX = 1;
        }
        // horizontal boundaries
        if( this . x < 0 ) this . x = 0;
        else if ( this . x > this . game . width - this . width ) this . x = this . game . width - this . width;
    }

    shoot(){
        // defining the players ability to shoot - its needed to use this context and of course projectiles properties and objects
        const projectile = this . game . getProjectile();
        if( projectile ) projectile . start( this . x + this . width / 2  , this . y );
    }

    restart() {
        this.x = this.game.width * 0.5 - this.width * 0.5; // Reset position
        this.y = this.game.height - this.height;
        this.lives = 3; // Reset lives
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = new Player(this);
        // to retain keyboard interactions
        this . keys = [];

        this . projectilesPool = [];
        this . numberOfProjectiles = 20;
        this . createProjectiles();
        this.fired = false;

        this . columns = 1;
        this . rows = 1;
        this . enemySize = 80;

        this . waves = [];
        //this . waves . push( new Wave( this ) ); /// parsing new game via this indicator to the wave constructor so enemies might get spwaned
        this . waveCount = 1;

        this . spriteUpdate = false;
        this . spriteTimer = 0;
        this . spriteInterval = 80;

        this.bossArray = [];
        this.bossLives = 20;
        this.restart();

        //this . nextWaveTrigger = false;

        // adding score term
        this . score = 0;
        this . gameOver = false; 

        // add event listeners for key controls
        window . addEventListener( "keydown" , (e) =>{
            if( this.keys.indexOf( e.key ) === -1 ) this.keys.push( e.key );    
            if( e.key === ' ' && !this.fired )   this.player.shoot();
            this . fired = true;
            if( e.key === 'r' && this.gameOver )   this.restart();
        } );
        window . addEventListener( "keyup" , (e) => {
            this.fired = false;
            if( this . keys . indexOf( e.key ) > -1 ) this . keys . splice( this . keys . indexOf( e . key ) , 1 );
        } );
        // i leave only one trigger
    }

    render( ctx , deltaTime ){
        //sprite timing
        if( this.spriteTimer > this.spriteInterval ){
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        }else{
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }

        
        this . drawStatusText( ctx );
        this.player.draw(ctx); // Pass ctx to player's draw method
        this.player.update();
        
        this . projectilesPool . forEach( projectile => {
            projectile . update();
            projectile . draw( ctx );
        } );

        this.bossArray.forEach( boss => {
            boss.update();
            boss.draw(ctx);
        })
        this.bossArray = this.bossArray.filter( object => !object.markedForDeletion );

        this . waves . forEach( wave => {
            wave . render( ctx );
            if( wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver ){
                this.newWave();
                //this.waveCount++;
                wave.nextWaveTrigger = true;
            }
        } );
        
    }
    // creating projectiles object pool
    createProjectiles(){
        for( let i = 0 ; i < this . numberOfProjectiles ; i ++ ){
            this . projectilesPool . push( new Projectile() );
        }
    }
    getProjectile(){
        for( let i = 0 ; i < this . projectilesPool . length ; ++ i ){
            if( this . projectilesPool[i] . free ) return this . projectilesPool[i];
        }
    }

    // collisio detection for 2 rectangles
    checkCollision( a , b ){
        return(
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y 
        ); // this should hold true for collision
    }
    // in game class we create score accounting
    drawStatusText( context ){
        context . save();
        context . shadowOffsetX = 2;
        context . shadowOffsetY = 2;
        context . shadowColor = 'black';
        context . fillText( "Score: " + this . score , 20 , 40 );
        context . fillText( "Wave: " + this . waveCount , 20 , 80 )
        for( let i=0 ; i < this.player.maxLives; i++ ){
            context . strokeRect( 20 + 20 * i , 100 , 10 , 15 );
        }
        //this.score = 0;
        for( let j= 0 ; j < Math.min(this.player.lives , this.player.maxLives) ; j++ ){
            context . fillRect( 20 + 20 * j , 100 , 10 , 15 )
        }

        context.save();
        this.player.cooldown ? context.fillStyle = 'red' : context.fillStyle = 'gold';

        // energy barr metrics
        for( let i = 0; i < this.player.energy ; i++ ){
            context . fillRect( 20 + 2*i , 130 , 2 , 15 );
        }

        if(this.gameOver){
            context.textAlign = 'center';
            context.font = '70px Impact';
            context.fillText( 'GAME OVER!' , this.width*0.5 , this.height*0.5 );
            context.font = "20px Impact";
            context.fillText( 'Press R to restart!' , this.width * 0.5 , this.height * 0.5 + 30  );
        }
        context . restore();
    }
    // new wave creator function
    newWave(){
        this.waveCount++;
        if( this.player.lives < this.player.maxLives ) this.player.lives++;
        if( this.waveCount % 2 === 0 ){
            this.bossArray.push( new Boss(this , this.bossLives ) );
        }else{
            if( Math.random() < 0.5 && this.columns * this.enemySize < this.width ){
                this.columns++;
            } else if( this.rows * this.enemySize < this.height * this . height ){    
                this.rows++;
            }
            this.waves.push(new Wave(this));
        }
        this.waves = this.waves.filter( object => !object.markedForDeletion );
    }
    restart(){
        this.player.restart();
        this.columns=2; // reset to default
        this.rows=2; // reset to default
        this.waves=[];
        this.bossArray=[];
        this.bossLives= 20;
        //this.waves.push( new Wave( this ) );
        this.bossArray.push( new Boss( this , this.bossLives ) );
        this.waveCount = 1;
        this.score = 0;
        this.gameOver = false;
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 800;
    ctx . fillStyle = 'white';
    ctx . strokeStyle = 'white';
    ctx . lineWidth = 1;
    ctx . font = "30px Impact";

    // creation of new game instance
    const game = new Game(canvas);

    let lastTime = 0;
    
    function animate( timeStamp ){
        
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // V8 works at 1000ms / 16.6 ~ 60fps
        // ---> created  a time interval

        ctx.clearRect( 0, 0, canvas.width, canvas.height );
        game.render( ctx , deltaTime ); // Pass ctx to game's render method
        requestAnimationFrame( animate );
    }
    animate( 0 );
});