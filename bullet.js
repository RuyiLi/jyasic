class Bullet{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.velY = -5;
		this.sprite = 'assets/bullet.png'
	    this.image = new Image()
	    this.image.src = this.sprite;
	}

	render(ctx){
		this.y += this.velY;
		ctx.drawImage(this.image, this.x, this.y);
	}
}