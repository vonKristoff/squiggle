SQUIGGLE
========

This jQuery plugin will generate a HTML5 Canvas made png to draw a 'squiggle' over your text, like a strike-through or underline.

<a href='http://bite-software.co.uk/squiggle'>Plugin Site</a>

BASIC USAGE:
```javascript
$('.element').plugin({
	intensity:50,
	thickness:3
});
```
<h1>config options:</h1>

| Option      | data type   | values        | Required 						| Nb.                						  | 
| ------------|-------------|---------------|-------------------------------|---------------------------------------------|
| intensity   | int         | 0 -> infinity	| No - defaults to 30   		| How intense the squiggle is				  |       
| thickness   | int        	| 1 -> ?        | No -> default is auto mode    | Auto mode will figure out a good thickness based on your font-size |              
<h1>HTML setup</h1>
```html
<p>Lorem ipsum dolor sit amet, <span class='scribble'>consectetur</span> adipiscing elit.</p>
```
<h1>usage example</h1>
```javascript
$('.scribble').squiggle();
```