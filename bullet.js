class Bullet{
	constructor(x, y, target = null){
		this.x = x;
		this.y = y;
		this.velY = -5;
		this.velX = 0;
		this.sprite = 'assets/bullet.png'
	    this.image = new Image()
	    this.image.src = this.sprite;
	    this.target = target;
	}

	render(ctx){
		if(this.target){
			let deltaX = this.target.x - this.x;
			let deltaY = this.target.y - this.y;
			let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			deltaX /= distance;
			deltaY /= distance;
			this.x += 10 * deltaX;
			this.y += 10 * deltaY;
		}else{
			this.y += this.velY;
			this.x += this.velX;
		}
		ctx.drawImage(this.image, this.x, this.y);
	}
}