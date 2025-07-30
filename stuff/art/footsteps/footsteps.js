class Footstep {
    constructor(x, y, size, direction, color, p) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 255;
        this.step = 4;
        this.toBeRemoved = false;
        this.direction = direction;
        this.color = color;
        this.p = p;
    }

    // display the footstep
    display() {
        // write the current opacity on top of circle
        // this.p.fill(0);
        // this.p.text(this.opacity, this.x, this.y);

        // blue
        // this.p.fill(0, 0, 255, this.opacity);

        this.p.fill(this.color, this.opacity);


        // draw two rectangles side by side considering the direction
        this.p.push();
        this.p.translate(this.x, this.y);
        this.p.rotate(this.direction);
        this.p.rect(-this.size / 2, -this.size / 2, this.size + 5, this.size - 2);
        this.p.rect(-this.size / 2 - 7, -this.size / 2 + 1, this.size / 2, this.size / 2);

        // red
        // this.p.fill(255, 0, 0, this.opacity);

        this.p.rect(-this.size / 2 + 17, this.size / 2 + 10, this.size + 5, this.size - 2);
        this.p.rect(-this.size / 2 + 10, this.size / 2 + 11, this.size / 2, this.size / 2);
        this.p.pop();
    }

    // update the footstep
    update() {
        this.opacity -= this.step;

        if (this.opacity <= 0) {
            this.toBeRemoved = true;
        }
    }
}

let footsteps = [];
let mouse = { x: 0, y: 0 };
let direction = 0;

function sketch(p) {
    p.setup = function() {
        p.createCanvas(800, 800);
        p.background(240);
        p.noStroke();
        // // Get input elements
        // colorPicker = document.getElementById('colorPicker');
        // sizeSlider = document.getElementById('sizeSlider');
        // showEllipse = document.getElementById('showEllipse');
        // shapeSelect = document.getElementById('shapeSelect');
        // customText = document.getElementById('customText');
        // randomizeBtn = document.getElementById('randomizeBtn');
        // // Button event
        // randomizeBtn.addEventListener('click', () => {
        //     ellipseX = Math.floor(Math.random() * p.width);
        //     ellipseY = Math.floor(Math.random() * p.height);
        // });
    };

    p.draw = function() {
        p.background(245);
        // display and update each footstep
        for (let i = 0; i < footsteps.length; i++) {
            footsteps[i].display();
            footsteps[i].update();
        }

        footsteps = footsteps.filter(footstep => !footstep.toBeRemoved);

        // create a new footstep every 10 frames at mouse
        if (p.frameCount % 1 === 0) {

            // if mouse is moving
            let distance = p.dist(p.mouseX, p.mouseY, mouse.x, mouse.y);
            if (distance > 60){
            // if (p.mouseX !== mouse.x || p.mouseY !== mouse.y) {
                direction = p.atan2(p.mouseY - mouse.y, p.mouseX - mouse.x);

                mouse.x = p.mouseX;
                mouse.y = p.mouseY;

                // create a new footstep at mouse
                if(p.mouseIsPressed){
                    footsteps.push(new Footstep(p.mouseX, p.mouseY, 8, direction, p.color(255, 0, 0), p));
                }else{
                    footsteps.push(new Footstep(p.mouseX, p.mouseY, 8, direction, p.color(0, 0, 0), p));
                }
            }
        }
    }

    // Optional: update position on mouse move
    p.mouseMoved = function() {
        ellipseX = p.mouseX;
        ellipseY = p.mouseY;
    }
}

new p5(sketch, 'p5-container');
