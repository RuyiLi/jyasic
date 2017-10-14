class Enemy{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.i = 0;
		this.maxHp = 3;
		this.hp = 3; //Don't add this in at first, do it later on when the people actually sort of understand what's going on
		this.speed = 1;
		this.sheet = 'assets/enemy.png'
	    this.image = new Image()
	    this.width = this.height = 32;
	    this.image.src = this.sheet;
	    this.rof = 120;
	    this.shoot = this.rof > 10 ? Math.floor(Math.random() * 100) : 0;
	}

	render(ctx){
		this.i = this.i === 3 ? 0 : this.i + 1;
		this.x += this.speed;
		if((this.x >= 936 && this.speed > 0) || (this.x <= 32 && this.speed < 0)){
		 	this.speed = -this.speed;
		 	this.y += 40;
		}
		ctx.drawImage(this.image, this.i * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		
		//Again, add this crap later on.
		ctx.fillStyle = '#FF0000'; //Red
		ctx.fillRect(this.x + this.width / 2 - (this.maxHp / 12 * this.width), this.y - 5, (this.maxHp / 6 * this.width), 5);
		ctx.fillStyle = '#00FF00'; //Green
		ctx.fillRect(this.x + this.width / 2 - (this.maxHp / 12 * this.width), this.y - 5, (this.hp / 6 * this.width), 5);
	}
}