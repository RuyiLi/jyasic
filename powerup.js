class Powerup{
	constructor(x, y, type){
		this.x = x;
		this.y = y;
		this.type = type;
	}

	render(ctx){
		if(this.type === 'penta beam') ctx.fillStyle = '#28ff97';
		else if(this.type === 'nanobots') ctx.fillStyle = '#1fdd02';
		else if(this.type === 'hyper light drifter') ctx.fillStyle = '#0e94f4';
		else if(this.type === 'photon overdrive') ctx.fillStyle = '#e1e510';
		else if(this.type === 'risk of rain') ctx.fillStyle = '#C11BD1';
		else if(this.type === 'adagio redshift') ctx.fillStyle = '#e80909';
		else if(this.type === 'hack://override') ctx.fillStyle = '#ff4949';
		else if(this.type === 'energy barrier') ctx.fillStyle = '#56ff59';
		ctx.fillRect(this.x, this.y, 20, 20);
	}
}