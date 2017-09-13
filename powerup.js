class Powerup{
	constructor(x, y, type){
		this.x = x;
		this.y = y;
		this.type = type;
	}

	render(ctx){
		if(this.type === 'penta beam') ctx.fillStyle = '#FF0000';
		else if(this.type === 'nanobots') ctx.fillStyle = '#00FF00';
		else if(this.type === 'hyper light drifter') ctx.fillStyle = '#0000FF';
		else if(this.type === 'photon overdrive') ctx.fillStyle = '#FFFF00';
		else if(this.type === 'risk of rain') ctx.fillStyle = '#C11BD1';
		ctx.fillRect(this.x, this.y, 20, 20);
	}
}