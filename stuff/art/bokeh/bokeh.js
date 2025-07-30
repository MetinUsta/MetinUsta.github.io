let circles = [];
let colorIndex = 0;

let pastelColors = ["f94144", "f3722c", "f8961e", "f9844a", "f9c74f", "90be6d", "43aa8b", "4d908e", "577590", "277da1"];
let bluegreen = ["d9ed92", "b5e48c", "99d98c", "76c893", "52b69a", "34a0a4", "168aad", "1a759f", "1e6091", "184e77"]
let heatmap = ["03071e", "370617", "6a040f", "9d0208", "d00000", "dc2f02", "e85d04", "f48c06", "faa307", "ffba08"];
let cyanMagenta = ["f72585", "b5179e", "7209b7", "560bad", "480ca8", "3a0ca3", "3f37c9", "4361ee", "4895ef", "4cc9f0"];
let browns = ["edc4b3", "e6b8a2", "deab90", "d69f7e", "cd9777", "c38e70", "b07d62", "9d6b53", "8a5a44", "774936"];
let brw = ["0b090a", "161a1d", "660708", "a4161a", "ba181b", "e5383b", "b1a7a6", "d3d3d3", "f5f3f4", "ffffff"];
let washedColors = ["ef476f", "ffd166", "06d6a0", "118ab2", "073b4c"];

let palettes = [pastelColors, bluegreen, heatmap, cyanMagenta, browns, brw, washedColors];

for (let i = 0; i < palettes.length; i++) {
    for (let j = 0; j < palettes[i].length; j++) {
        palettes[i][j] = "#" + palettes[i][j];
    }
}

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
