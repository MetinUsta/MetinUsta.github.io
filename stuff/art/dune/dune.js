let strumSlider, saveBtn;

// Array of shape configurations
let red_color = [226, 163, 68];
let yellow_color = [197, 55, 45];

const shapes = [
    { height: 0, strum: 10, color: red_color, increment: 0.0005 },
    { height: 200, strum: 9, color: yellow_color, increment: 0.001 },
    { height: 400, strum: 10, color: red_color, increment: 0.002 },
    { height: 600, strum: 9, color: yellow_color, increment: 0.003 },
    { height: 800, strum: 10, color: red_color, increment: 0.005 },
    { height: 1000, strum: 10, color: yellow_color, increment: 0.007 },
    { height: 1200, strum: 15, color: red_color, increment: 0.01 }
];

// Initialize offsets randomly
let offsets = Array.from({ length: shapes.length }, () => Math.random() * 1000);

function sketch(p) {
    p.setup = function() {
        p5canvas = p.createCanvas(800, 800);
        strumSlider = document.getElementById('strumSlider');

        saveBtn = document.getElementById('saveBtn');

        saveBtn.addEventListener('click', () => {
            let link = document.createElement('a');
            link.download = 'dune_art.png';
            link.href = p5canvas.elt.toDataURL();
            link.click();
        });
    };

    p.drawShape = function(height, strum, offset) {
        p.strokeWeight(2);
        p.stroke(0);
        p.beginShape();
        p.vertex(0, p.height);
        for (let x = 0; x < p.width; x++) {
            let angle = offset + x * 0.01;
            let y = p.map(p.sin(angle), -strum, strum, 0, height);
            p.vertex(x, y);
        }
        p.vertex(p.width, p.height);
        p.endShape();
    }

    p.draw = function() {
        strum = parseFloat(strumSlider.value);
        p.background(240);
        p.noStroke();
        
        for (let i = 0; i < shapes.length; i++) {
            const { height, strum: shapeStrum, color, increment } = shapes[i];
            p.fill(...color);
            p.drawShape(height, shapeStrum, offsets[i]);
            offsets[i] += increment;
        }
        p.fill(0);
    }
}

new p5(sketch, 'p5-container');
