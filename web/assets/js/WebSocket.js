import { Gradient } from './Gradient.js'
const gradient = new Gradient();    // Create your instance
const CANVAS_ELEMENT = 'gradient-canvas';
gradient.initGradient('#'+CANVAS_ELEMENT);    // Call `initGradient` with the selector to your canvas


let current_scent;  // scent name (key)
let lights_cie;    // CIE color data
let prev_scent;

document.addEventListener('DOMContentLoaded', e => {
  // background animation (for testing) ---------
  /*const form_input = document.querySelector('input[type="text"]');
  const gradient_canvas = document.querySelector('#gradient-canvas');

  if(form_input && gradient_canvas){ 
    form_input.addEventListener('focus', (event) => {
      gradient_canvas.style.opacity = '0.25';
    });

    form_input.addEventListener('blur', (event) => {
      gradient_canvas.style.opacity = '0';
    });
  }*/

}, false);




// Web Socket Connection Handling
function connect(){
  const INPUT_ELEMENT = "input-scentType";
  const ESP_IP = "192.168.5.95";  // in case of 3L
  //const ESP_IP = "192.168.128.134";
  var connection = new WebSocket('ws://'+ESP_IP+':81/', ['arduino']);

  connection.onopen = function () {
    connection.send('Connect ' + new Date());
  };
  connection.onerror = function (error) {
    console.log('WebSocket Error ', error);
  };

  connection.onmessage = function (e) {  
    console.log(e.data);
    var scentData = e.data;
    
    if(is_json(scentData)) {
      var jsonObj = JSON.parse(scentData);
      current_scent = Object.keys(jsonObj)[0];  // scent name (key)
      lights_cie = jsonObj[current_scent];    // CIE color data

      if(current_scent != prev_scent && current_scent != "default") {
        document.getElementById(INPUT_ELEMENT).value = current_scent;   // update the value in input element
        
        // style update based on lights_cie
        var target = document.getElementById(CANVAS_ELEMENT);
        var hexArray = [];

        for (var l in lights_cie) {
          var x = jsonObj[current_scent][l][0];
          var y = jsonObj[current_scent][l][1];
          var rgbArray = String(cie_to_rgb(x, y)).split(',');
          hexArray.push( ConvertRGBtoHex(parseInt(rgbArray[0]), parseInt(rgbArray[1]), parseInt(rgbArray[2])) );
        }
        // let style = window.getComputedStyle(target);
        // let value = style.getPropertyValue('--gradient-color-1');
        // console.log(value);

        target.style.setProperty('--gradient-color-1', hexArray[0]);
        target.style.setProperty('--gradient-color-2', hexArray[1]);
        target.style.setProperty('--gradient-color-3', hexArray[2]);
        target.style.setProperty('--gradient-color-4', "#ffffff"); 

        gradient.init();  // update gradient canvas background

        prev_scent = current_scent;   // update prev_scent
      }
    }
  };

  connection.onclose = function(){
    console.log('WebSocket connection closed');
    setTimeout(connect, 500);
  };
}

connect();


let is_json = data => {
  try {
    JSON.parse(data);
  } catch (error) {
    return false;
  }
  return true;
}

/*
function sendType() {
    var scentType = document.getElementById('scentType').value;
    typestr = '#' + scentType.toString(10); 
    console.log('Type: ' + typestr); 
    connection.send(typestr);

    window.print();
}
*/


function ColorToHex(color) {
  var hexadecimal = color.toString(16);
  return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
  return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}





/*
With these functions you can convert the CIE color space to the RGB color space and vice versa.

The developer documentation for Philips Hue provides the formulas used in the code below:
https://developers.meethue.com/documentation/color-conversions-rgb-xy

I've used the formulas and Objective-C example code and transfered it to JavaScript.


Examples:

var rgb = cie_to_rgb(0.6611, 0.2936)
var cie = rgb_to_cie(255, 39, 60)

------------------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2017 www.usolved.net
Published under https://github.com/usolved/cie-rgb-converter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/




/**
 * Converts CIE color space to RGB color space
 * @param {Number} x
 * @param {Number} y
 * @param {Number} brightness - Ranges from 1 to 254
 * @return {Array} Array that contains the color values for red, green and blue
 */
function cie_to_rgb(x, y, brightness)
{
  //Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
  if (brightness === undefined) {
    brightness = 254;
  }

  var z = 1.0 - x - y;
  var Y = (brightness / 254).toFixed(2);
  var X = (Y / y) * x;
  var Z = (Y / y) * z;

  //Convert to RGB using Wide RGB D65 conversion
  var red   =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  var green   = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  var blue  =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

  //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
  if (red > blue && red > green && red > 1.0) {

    green = green / red;
    blue = blue / red;
    red = 1.0;
  }
  else if (green > blue && green > red && green > 1.0) {

    red = red / green;
    blue = blue / green;
    green = 1.0;
  }
  else if (blue > red && blue > green && blue > 1.0) {

    red = red / blue;
    green = green / blue;
    blue = 1.0;
  }

  //Reverse gamma correction
  red   = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
  green   = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
  blue  = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;


  //Convert normalized decimal to decimal
  red   = Math.round(red * 255);
  green   = Math.round(green * 255);
  blue  = Math.round(blue * 255);

  if (isNaN(red))
    red = 0;

  if (isNaN(green))
    green = 0;

  if (isNaN(blue))
    blue = 0;


  return [red, green, blue];
}


/**
 * Converts RGB color space to CIE color space
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @return {Array} Array that contains the CIE color values for x and y
 */
function rgb_to_cie(red, green, blue)
{
  //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
  var red   = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
  var green   = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
  var blue  = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

  //RGB values to XYZ using the Wide RGB D65 conversion formula
  var X     = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  var Y     = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  var Z     = red * 0.000088 + green * 0.072310 + blue * 0.986039;

  //Calculate the xy values from the XYZ values
  var x     = (X / (X + Y + Z)).toFixed(4);
  var y     = (Y / (X + Y + Z)).toFixed(4);

  if (isNaN(x))
    x = 0;

  if (isNaN(y))
    y = 0;   


  return [x, y];
}
