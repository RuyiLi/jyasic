class Explosion{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.i = 0;
		this.sheet = 'assets/explode.png'
	    this.image = new Image()
	    this.width = this.height = 128;
	    this.image.src = this.sheet;
	}

	render(ctx){
		this.i += 1;
		ctx.drawImage(this.image, this.i * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
	}
}