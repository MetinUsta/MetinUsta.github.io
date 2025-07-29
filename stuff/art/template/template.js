let colorPicker, sizeSlider, showEllipse, shapeSelect, customText, randomizeBtn;
let ellipseX = 400, ellipseY = 400;

function sketch(p) {
    p.setup = function() {
        p.createCanvas(800, 800);
        p.background(240);
        // Get input elements
        colorPicker = document.getElementById('colorPicker');
        sizeSlider = document.getElementById('sizeSlider');
        showEllipse = document.getElementById('showEllipse');
        shapeSelect = document.getElementById('shapeSelect');
        customText = document.getElementById('customText');
        randomizeBtn = document.getElementById('randomizeBtn');
        // Button event
        randomizeBtn.addEventListener('click', () => {
            ellipseX = Math.floor(Math.random() * p.width);
            ellipseY = Math.floor(Math.random() * p.height);
        });
    };

    p.draw = function() {
        p.background(240);
        if (showEllipse.checked) {
            let col = p.color(colorPicker.value);
            p.fill(col);
            let size = parseInt(sizeSlider.value);
            if (shapeSelect.value === 'ellipse') {
                p.ellipse(ellipseX, ellipseY, size, size);
            } else {
                p.rect(ellipseX - size/2, ellipseY - size/2, size, size);
            }
        }
        // Draw custom text
        if (customText.value) {
            p.fill(0);
            p.textSize(32);
            p.text(customText.value, 50, p.height - 50);
        }
    }

    // Optional: update position on mouse move
    p.mouseMoved = function() {
        ellipseX = p.mouseX;
        ellipseY = p.mouseY;
    }
}

new p5(sketch, 'p5-container');
