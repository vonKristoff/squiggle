/**
* Squiggle jQuery plug-in
* Scribble out your content with a Squiggle
*
* @author Jean-Christophe Nicolas <mrjcnicolas@gmail.com>
* @homepage http://bite-software.co.uk/squiggle/
* @version 0.1.0
* @license MIT http://opensource.org/licenses/MIT
* @date 2013-09-13
*/
(function($) {

$.fn.squiggle = function(options){
	
	var el = $(this),
		process = new Plugin(el,options);

			
	return this.el;	
}

var Plugin = function(self,options){

	this.config = {	
		intensity:30,
		thickness:false
	}
	$.extend(this.config,options);

	console.log(this.config.thickness);

	this.el = self;
	this.points = [];
	
	this.init();
}

Plugin.prototype.init = function(){

	this.cWidth = parseInt(this.el.css('width')) * 2.25;
	this.cHeight = parseInt(this.el.css('font-size'));
	this.colour = this.el.css('color');

	this.el.css({
		'text-shadow':'none'
	})

	this.step = this.cWidth/this.config.intensity;
	this.padding = this.cHeight * 0.2;
	
	this.thickness = (!this.config.thickness)? ~~(this.padding) : this.config.thickness;
	console.log(this.thickness);
	this.canvas = this.buildCanvas();

	this.buildSpline();
	this.spline.draw(this.ctx,this.colour,this.thickness);


	this.addSquiggle();
}

Plugin.prototype.buildCanvas = function(){

	var canvas = document.createElement( 'canvas' );
	canvas.width = this.cWidth; canvas.height = this.cHeight;
	// document.body.appendChild( canvas );
	this.ctx = canvas.getContext( '2d' );
	return canvas

}
Plugin.prototype.Vector = function(opt){

	var defaults = {
		x:0,
		y:0
	}
	var obj = $.extend(defaults,opt);
	
	return obj
}
Plugin.prototype.buildSpline = function(){

	var firstY;

	for(var i=0;i<=this.config.intensity;i++){

		var ry = this.padding + Math.random()*(this.cHeight - this.padding*1.5);

		if(i == 0)firstY = ry;
		if(i == this.config.intensity)ry = firstY;

		var vector = this.Vector({
			x:this.step * i,
			y:ry
		})

		this.points[i] = vector;
	}

	this.spline = new Spline({points:this.points});

}

Plugin.prototype.addSquiggle = function(){

	var img = this.convertCanvasToImage(this.canvas);

	this.el.css({
		'display':'inline',
		'background':'url('+ img +') repeat-x'
	})

}

Plugin.prototype.convertCanvasToImage = function(canvas) {
	
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	
	return image.src;
}

var Spline = function(options){
	
	this.points = options.points || [];
	this.resolution = options.resolution || 1000;
	this.tension = options.tension || 0.85;
	
	this.centers = [];
	this.controls = [];
	// this.stepLength = options.stepLength || 60;
	this.length = this.points.length;
	this.delay = 0;
	// this is to ensure compatibility with the 2d version
	for(var i=0; i<this.length; i++) this.points[i].z = this.points[i].z || 0;
	for(var i=0; i<this.length-1; i++){
		var p1 = this.points[i];
		var p2 = this.points[i+1];
		this.centers.push({x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2, z:(p1.z+p2.z)/2});
	}
	this.controls.push([this.points[0],this.points[0]]);
	for(var i=0; i<this.centers.length-1; i++){
		var p1 = this.centers[i];
		var p2 = this.centers[i+1];
		var dx = this.points[i+1].x-(this.centers[i].x+this.centers[i+1].x)/2;
		var dy = this.points[i+1].y-(this.centers[i].y+this.centers[i+1].y)/2;
		var dz = this.points[i+1].z-(this.centers[i].y+this.centers[i+1].z)/2;
		this.controls.push([{
			x:(1.0-this.tension)*this.points[i+1].x+this.tension*(this.centers[i].x+dx),
			y:(1.0-this.tension)*this.points[i+1].y+this.tension*(this.centers[i].y+dy),
			z:(1.0-this.tension)*this.points[i+1].z+this.tension*(this.centers[i].z+dz)},
		{
			x:(1.0-this.tension)*this.points[i+1].x+this.tension*(this.centers[i+1].x+dx),
			y:(1.0-this.tension)*this.points[i+1].y+this.tension*(this.centers[i+1].y+dy),
			z:(1.0-this.tension)*this.points[i+1].z+this.tension*(this.centers[i+1].z+dz)}]);
	}
	this.controls.push([this.points[this.length-1],this.points[this.length-1]]);

	return this;
}
Spline.prototype.pos = function(t){

	function bezier(t, p1, c1, c2, p2){
		var B = function(t) { 
			var t2=t*t, t3=t2*t;
			return [(t3),(3*t2*(1-t)),(3*t*(1-t)*(1-t)),((1-t)*(1-t)*(1-t))]
		}
		var b = B(t)
		var pos = {
			x : p2.x * b[0] + c2.x * b[1] +c1.x * b[2] + p1.x * b[3],
			y : p2.y * b[0] + c2.y * b[1] +c1.y * b[2] + p1.y * b[3],
			z : p2.z * b[0] + c2.z * b[1] +c1.z * b[2] + p1.z * b[3]
		}
		return pos; 
	}
	var t = t;
	if(t<0) t=0;
	if(t>this.resolution) t=this.resolution-1;
	
	var t2 = (t)/this.resolution;
	if(t2>=1) return this.points[this.length-1];

	var n = Math.floor((this.points.length-1)*t2);
	var t1 = (this.length-1)*t2-n;

	return bezier(t1,this.points[n],this.controls[n][1],this.controls[n+1][0],this.points[n+1]);
}

Spline.prototype.draw = function(ctx,color,thickness){
	ctx.strokeStyle = color || "#7e5e38"; // line color
	ctx.lineWidth = thickness || 8;
	ctx.beginPath();
	var pos;
	for(var i=0; i<this.resolution; i++){
		pos = this.pos(i); //bezier(i/max,p1, c1, c2, p2);
		// if(Math.floor(i/100)%2==0) ctx.lineTo(pos.x, pos.y);
		if(i!=0) ctx.lineTo(pos.x, pos.y);
		else ctx.moveTo(pos.x, pos.y);
	}
	ctx.stroke();
	return this;
}

})(jQuery);