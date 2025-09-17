import { clonePalettes } from '../shared/palettes.js';

let circles = [];
let colorIndex = 0;

const palettes = clonePalettes();
let allowedColors = palettes[colorIndex];

class RubberBand {
    constructor(x, y, radius, color, strokeWeight, start, stop, p) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.strokeWeight = strokeWeight;
        this.start = start;
        this.stop = stop;
        this.p = p;
    }

    draw() {
        this.p.noFill();
        this.p.stroke(this.color);
        this.p.strokeWeight(this.strokeWeight);

        // use this.p.arc and angle
        this.p.arc(this.x, this.y, this.radius, this.radius, this.start, this.stop);

        // p.circle(this.x, this.y, this.radius);
    }
}
let context = null;

function sketch(p) {
    p.setup = function () {
        const canvas = p.createCanvas(800, 800);
        p.noStroke();
        p.pixelDensity(6.0);
        p.background(245);

        context = canvas.elt.getContext('2d');
        context.shadowColor = 'rgba(0, 0, 0, 0.7)';
        context.shadowBlur = 1;
        context.shadowOffsetX = 35;
        context.shadowOffsetY = 35;
        // Get input elements
        darkMode = document.getElementById('darkMode');

        darkMode.addEventListener('change', () => {
                if (darkMode.checked) {
                    p.background(25);
                    context.shadowColor = 'rgba(255, 255, 255, 0.7)';
                } else {
                    p.background(245);
                    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
                }
            }
        );

        themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', () => {
            colorIndex = themeSelect.selectedIndex;
            allowedColors = palettes[colorIndex];
        });

        downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.addEventListener('click', () => {
            p.saveCanvas('bokeh', 'png');
        });

        // randomizeBtn.addEventListener('click', () => {
        //     ellipseX = Math.floor(Math.random() * p.width);
        //     ellipseY = Math.floor(Math.random() * p.height);
        // });
    };

    p.mouseDragged = function () {
        if (p5.mouseButton != p5.LEFT) return;
        let color = p.color(allowedColors[p.floor(p.random(0, allowedColors.length))]);
        // color = '#' + color;

        let radius = p.random(50, 200);
        let strokeWeight = p.random(5, 20);
        let start = p.random(0, p.TWO_PI);
        let stop = p.random(0, p.TWO_PI);
        let rubberBand = new RubberBand(p.mouseX, p.mouseY, radius, color, strokeWeight, start, stop, p);
        rubberBand.draw();
        // circles.push(rubberBand);

        if (circles.length > 400) {
            circles.shift();
        }
    }

    p.mousePressed = function () {
        if (p.mouseButton === p.CENTER) {
            colorIndex++;
            if (colorIndex >= palettes.length) {
                colorIndex = 0;
            }
            allowedColors = palettes[colorIndex];
        }
    }

    p.keyPressed = function () {
        if (p.key === 'c') {
            p.clear();
            circles = [];
            p.background(darkMode.checked ? 25 : 245);
            context.shadowColor = darkMode.checked ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        } else if (p.key === 'v') {
            colorIndex++;
            if (colorIndex >= palettes.length) {
                colorIndex = 0;
            }
            allowedColors = palettes[colorIndex];
        } else if (p.key === 't') {
            darkMode.checked = !darkMode.checked;
            if (darkMode.checked) {
                p.background(25);
            } else {
                p.background(245);
            }
        } else if (p.key === 'd') {
            p.saveCanvas('bokeh', 'png');
        }
    };

    p.draw = function () {
    }
}

new p5(sketch, 'p5-container');
