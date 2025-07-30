class Triangle {
    constructor(points, color, incircleMode, strokeMode, p) {
        this.points = points;
        this.color = color;
        this.toBeRemoved = false;
        this.incircleMode = incircleMode;
        this.strokeMode = strokeMode;
        this.p = p;
    }

    display() {
        this.p.fill(this.color);
        if (this.strokeMode) {
            this.p.stroke(24, 24, 24);
        } else {
            this.p.noStroke();
        }
        this.p.triangle(
            this.points.p1.x, this.points.p1.y,
            this.points.p2.x, this.points.p2.y,
            this.points.p3.x, this.points.p3.y
        );

        if (this.incircleMode) {
            let center = this.findIncenter();
            let radius = this.findIncircleRadius();
            this.p.stroke(48, 48, 48);
            this.p.strokeWeight(4);
            this.p.circle(center.x, center.y, radius * 2);
            this.p.stroke(24, 24, 24);
            this.p.strokeWeight(1);
        }
    }

    findIncircleRadius() {
        let a = this.findDistance(this.points.p1, this.points.p2);
        let b = this.findDistance(this.points.p2, this.points.p3);
        let c = this.findDistance(this.points.p3, this.points.p1);

        let p = (a + b + c) / 2;

        let radius = Math.sqrt((p - a) * (p - b) * (p - c) / p);

        return radius;
    }

    findIncenter() {
        let a = this.findDistance(this.points.p1, this.points.p2);
        let b = this.findDistance(this.points.p2, this.points.p3);
        let c = this.findDistance(this.points.p3, this.points.p1);

        let p = (a + b + c) / 2;

        let incenter = {
            x: (a * this.points.p3.x + b * this.points.p1.x + c * this.points.p2.x) / (a + b + c),
            y: (a * this.points.p3.y + b * this.points.p1.y + c * this.points.p2.y) / (a + b + c)
        }

        return incenter;
    }

    findDistance(point1, point2) {
        let distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        return distance;
    }

    sign(point1, point2, point3) {
        return (point1.x - point3.x) * (point2.y - point3.y) - (point2.x - point3.x) * (point1.y - point3.y);
    }

    checkInTriangle(mouseX, mouseY) {
        let b1, b2, b3;

        b1 = this.sign({ x: mouseX, y: mouseY }, this.points.p1, this.points.p2) < 0.0;
        b2 = this.sign({ x: mouseX, y: mouseY }, this.points.p2, this.points.p3) < 0.0;
        b3 = this.sign({ x: mouseX, y: mouseY }, this.points.p3, this.points.p1) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    }
}

let triangles = [];
let clickCount = 0;
let incircleMode = false;
let strokeMode = true;
let colorIndex = 0;

let pastelColors = ["f94144","f3722c","f8961e","f9844a","f9c74f","90be6d","43aa8b","4d908e","577590","277da1"];
let bluegreen = ["d9ed92","b5e48c","99d98c","76c893","52b69a","34a0a4","168aad","1a759f","1e6091","184e77"]
let heatmap = ["03071e","370617","6a040f","9d0208","d00000","dc2f02","e85d04","f48c06","faa307","ffba08"];
let cyanMagenta = ["f72585","b5179e","7209b7","560bad","480ca8","3a0ca3","3f37c9","4361ee","4895ef","4cc9f0"];
let browns = ["edc4b3","e6b8a2","deab90","d69f7e","cd9777","c38e70","b07d62","9d6b53","8a5a44","774936"];
let brw = ["0b090a","161a1d","660708","a4161a","ba181b","e5383b","b1a7a6","d3d3d3","f5f3f4","ffffff"];
let washedColors = ["ef476f","ffd166","06d6a0","118ab2","073b4c"];

let palettes = [pastelColors, bluegreen, heatmap, cyanMagenta, browns, brw, washedColors];

for (let i = 0; i < palettes.length; i++) {
    for (let j = 0; j < palettes[i].length; j++) {
        palettes[i][j] = "#" + palettes[i][j];
    }
}

let allowedColors = palettes[colorIndex];
let randomMode = true;
let width = 800;
let height = 800;

function sketch(p) {
    p.setup = function() {
        p.createCanvas(width, height);
        p.noStroke();
        p.smooth();
        p.pixelDensity(6.0);
        // // Get input elements
        // colorPicker = document.getElementById('colorPicker');
        // sizeSlider = document.getElementById('sizeSlider');
        // showEllipse = document.getElementById('showEllipse');
        themeSelect = document.getElementById('themeSelect');
        // themeselect values are 0 to 6 but as str
        themeSelect.addEventListener('change', () => {
            colorIndex = parseInt(themeSelect.value);
            allowedColors = palettes[colorIndex];
            p.background(245);
            triangles = [];
            clickCount = 0;
        });

        showLines = document.getElementById('showLines'); // Show lines checkbox
        showLines.addEventListener('change', () => {
            strokeMode = showLines.checked;
            for (let i = 0; i < triangles.length; i++) {
                triangles[i].strokeMode = strokeMode;
            }
        });

        showIncircle = document.getElementById('showIncircle'); // Show incircle checkbox
        showIncircle.addEventListener('change', () => {
            incircleMode = showIncircle.checked;
            for (let i = 0; i < triangles.length; i++) {
                triangles[i].incircleMode = incircleMode;
            }
        });

        downloadBtn = document.getElementById('downloadBtn'); // Save canvas button
        downloadBtn.addEventListener('click', () => {
            p.saveCanvas('triangles', 'png');
        });

        clearBtn = document.getElementById('clearBtn'); // Clear triangles button
        clearBtn.addEventListener('click', () => {
            triangles = [];
            clickCount = 0;
            p.background(245);
        });
    };

    p.makeDarker = function(color) {
        let r = color.levels[0] - 20 < 0 ? 0 : color.levels[0] - 20;
        let g = color.levels[1] - 20 < 0 ? 0 : color.levels[1] - 20;
        let b = color.levels[2] - 20 < 0 ? 0 : color.levels[2] - 20;
        let newColor = p.color(r, g, b);
        return newColor;
    };

    p.makeBrighter = function(color) {
        let r = color.levels[0] + 20 > 255 ? 255 : color.levels[0] + 20;
        let g = color.levels[1] + 20 > 255 ? 255 : color.levels[1] + 20;
        let b = color.levels[2] + 20 > 255 ? 255 : color.levels[2] + 20;
        let newColor = p.color(r, g, b);
        return newColor;
    };

    p.draw = function() {
        p.background(245);

        for (let i = 0; i < triangles.length; i++) {
            triangles[i].display();
        }

        triangles = triangles.filter(triangle => !triangle.toBeRemoved);
    }

    p.mousePressed = function() {
        if (p.mouseX < 0 || p.mouseX > 800 || p.mouseY < 0 || p.mouseY > 800) {
            return;
        }

        if (p.mouseButton === p.CENTER) {
            incircleMode = !incircleMode;

            for (let i = 0; i < triangles.length; i++) {
                triangles[i].incircleMode = incircleMode;
            }

            return;
        }

        if (p.mouseButton === p.RIGHT) {
            triangles = [];
            clickCount = 0;
            return;
        }

        clickCount++;
        let colors = [];
        if (!randomMode) {
            let color = p.color(allowedColors[Math.floor(Math.random() * allowedColors.length)]);
            let firstColor = color;
            let secondColor = p.makeDarker(color);
            let thirdColor = p.makeBrighter(color);
            let fourthColor = p.makeDarker(secondColor);
            colors = [firstColor, secondColor, thirdColor, fourthColor];
        } else {
            colors = [
                p.color(allowedColors[Math.floor(Math.random() * allowedColors.length)]),
                p.color(allowedColors[Math.floor(Math.random() * allowedColors.length)]),
                p.color(allowedColors[Math.floor(Math.random() * allowedColors.length)]),
                p.color(allowedColors[Math.floor(Math.random() * allowedColors.length)])
            ];
        }

        if (clickCount === 1) {

            let corners = [[0, 0], [800, 0], [800, 800], [0, 800]];
            let p1 = { x: p.mouseX, y: p.mouseY };

            for (let i = 0; i < 4; i++) {
                let p2 = { x: corners[i][0], y: corners[i][1] };
                let p3 = { x: corners[(i + 1) % 4][0], y: corners[(i + 1) % 4][1] };

                let points = { p1: p1, p2: p2, p3: p3 };
                let triangle = new Triangle(points, colors[i], incircleMode, strokeMode, p);
                triangles.push(triangle);
            }
        } else {
            let oldTriangle = null;
            for (let i = 0; i < triangles.length; i++) {

                if (triangles[i].checkInTriangle(p.mouseX, p.mouseY)) {

                    oldTriangle = triangles[i];
                    triangles[i].toBeRemoved = true;
                }
            }
            
            if (oldTriangle === null) {
                return;
            }

            let p1 = oldTriangle.points.p1;
            let p2 = oldTriangle.points.p2;
            let p3 = oldTriangle.points.p3;

            let oldPoints = [p1, p2, p3];
            for (let j = 0; j < 3; j++) {
                let new_p1 = oldPoints[j];
                let new_p2 = oldPoints[(j + 1) % 3];
                let new_p3 = { x: p.mouseX, y: p.mouseY };

                let newPoints = { p1: new_p1, p2: new_p2, p3: new_p3 };

                let newTriangle = new Triangle(newPoints, colors[j], incircleMode, strokeMode, p);

                triangles.push(newTriangle);
            }
        }
    }

    p.keyPressed = function() {
        if (p.key === 's') {
            strokeMode = !strokeMode;

            if (strokeMode) {
                for (let i = 0; i < triangles.length; i++) {
                    triangles[i].strokeMode = strokeMode;
                }
            } else {
                for (let i = 0; i < triangles.length; i++) {
                    triangles[i].strokeMode = strokeMode;
                }
            }
        } else if (p.key === 'r') {
            randomMode = !randomMode;
        } else if (p.key === 'v'){
            colorIndex++;
            if(colorIndex >= palettes.length){
                colorIndex = 0;
            }
            allowedColors = palettes[colorIndex];
        } else if (p.key === 'd') {
            // save canvas
            p.saveCanvas('triangles', 'png');
        } else if (p.key === 'c') {
            // Clear all triangles
            triangles = [];
            clickCount = 0;
        }
    }

    // Optional: update position on mouse move
    p.mouseMoved = function() {
        ellipseX = p.mouseX;
        ellipseY = p.mouseY;
    }
}

new p5(sketch, 'p5-container');
