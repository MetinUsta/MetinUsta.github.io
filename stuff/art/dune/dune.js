let strumSlider, saveBtn;

let theme = 'Default';

class ColorPalette {
    constructor(
        primaryColor,
        secondaryColor,
        shadowColor,
    ) {
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.shadowColor = shadowColor;
    }

    get primary() {
        return this.primaryColor;
    }

    get secondary() {
        return this.secondaryColor;
    }

    get shadow() {
        return this.shadowColor;
    }
}

themes = {
    Default: new ColorPalette(
        [222, 159, 66], // primary yellow
        [240, 90, 37], // secondary red
        [198, 56, 46] // shadow darker red
    ),
    Cold: new ColorPalette(
        [235, 242, 250], // primary light blue
        [66, 122, 161], // secondary dark blue
        [6, 71, 137] // shadow dark blue
    ),
    Emerald: new ColorPalette(
        [254, 250, 224], // primary green
        [96, 108, 56], // secondary dark green
        [40, 54, 24] // shadow darker green
    )
};

class Shadow {
    constructor(
        mean,
        std,
        pointCount,
        jiggle,
        verticalSpacing,
        strokeWeight,
        color,
        shapeYLocation,
        shapeHeight
    ){
        this.mean = mean;
        this.std = std;
        this.pointCount = pointCount;
        this.jiggle = jiggle;
        this.verticalSpacing = verticalSpacing;
        this.strokeWeight = strokeWeight;
        this.color = color;
        this.shapeYLocation = shapeYLocation;
        this.shapeHeight = shapeHeight;
    }

    draw(p, shapeYOutline) {
        p.stroke(...this.color);
        p.strokeWeight(this.strokeWeight);
        p.noFill();

        // Generate random numbers
        
        for (let x = 0; x < p.width; x++) {
            let yMaxLimit = shapeYOutline[x]
            // let center = this.mean + 400 * (1 / Math.abs(this.mean - yMaxLimit));
            let amplitude_ratio = (this.shapeYLocation - yMaxLimit) / this.shapeHeight;
            let spread = this.std + 3 * amplitude_ratio;
            let center = this.mean - 20 * amplitude_ratio;
            var numbers = p.drawNRandomNumbers(center, spread, this.pointCount);
            // Draw points with random offsets
            for (let i = 0; i < numbers.length; i++) {
                let y = numbers[i]; // Map to canvas height
                let randomOffset = p.random(-this.jiggle, this.jiggle); // Random offset for each point
                y += randomOffset; // Apply the random offset
    
                if (y > (yMaxLimit + this.verticalSpacing)) {
                    p.point(x, y);
                }
            }

        }

    }
}

class SandDune {
    constructor(
        yLocation,
        height,
        color,
        shadow
    ){
        this.yLocation = yLocation;
        this.height = height
        this.color = color;
        this.shadow = shadow; // Instance of Shadow class
    }

    draw(p, offset) {
        p.beginShape();
        p.noStroke();
        // p.stroke(...this.color);
        p.noFill();
        p.vertex(0, p.height);
        let shapeYOutline = [];
        for (let x = 0; x < p.width; x++) {
            let angle = offset + x * 0.01;
            let y = this.yLocation + p.map(p.sin(angle), -1, 1, -this.height, this.height);
            shapeYOutline.push(y);
            p.vertex(x, y);
        }
        p.vertex(p.width, p.height);
        p.fill(...this.color);
        // p.noStroke();
        p.endShape();

        // Draw shadow if it exists
        if (this.shadow) {
            this.shadow.draw(p, shapeYOutline);
        }
    }
}

class Star {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    draw(p) {
        p.fill(...this.color);
        p.noStroke();
        p.ellipse(this.x, this.y, this.size, this.size);
    }
}

function sketch(p) {
    p.setup = function () {
        p5canvas = p.createCanvas(600, 800);
        
        themeSelect = document.getElementById('themeSelect');

        saveBtn = document.getElementById('saveBtn');
        saveBtn.addEventListener('click', () => {
            let link = document.createElement('a');
            link.download = 'dune_art.png';
            link.href = p5canvas.elt.toDataURL();
            link.click();
        });

        redrawBtn = document.getElementById('redrawBtn');
        redrawBtn.addEventListener('click', () => {
            p.clear(); // Clear the canvas before redrawing
            theme = themeSelect.value;
            p.drawCover(theme);
        });

        p.noLoop(); // Prevent continuous drawing
    };

    p.drawStars = function (count, color = [255, 255, 255], yMinLimit, yMaxLimit, sizeMinLimit = 2, sizeMaxLimit = 5) {
        // should draw n circles between yMinLimit and yMaxLimit
        let drawnCount = 0;
        while (drawnCount < count) {
            let x = p.random(p.width);
            let y = p.random(yMinLimit, yMaxLimit);

            if (y > yMaxLimit || y < yMinLimit) {
                continue; // Skip if outside the limits
            }

            let size = p.random(sizeMinLimit, sizeMaxLimit);

            let star = new Star(x, y, size, color);
            star.draw(p);

            drawnCount++;
        }
    }

    p.drawNRandomNumbers = function (mean, std, n) {
        var numbers = [];
        for (let i = 0; i < n; i++) {
            let num = p.randomGaussian(mean, std);
            numbers.push(num);
        }

        return numbers;
    }

    p.drawCover = function (theme) {
        const shapes = [
            { yLocation: 200, color: themes[theme].primary },
            { yLocation: 300, color: themes[theme].secondary },
            { yLocation: 400, color: themes[theme].primary },
            { yLocation: 500, color: themes[theme].secondary },
            { yLocation: 600, color: themes[theme].primary },
            { yLocation: 700, color: themes[theme].secondary }
        ];
        
        const shadows = [
            { mean: 330, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
            { mean: 430, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
            { mean: 530, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
            { mean: 630, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
            { mean: 730, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
            { mean: 830, std: 30, pointCount: 150, jiggle: 15, verticalSpacing: 5, strokeWeight: 1, color: themes[theme].shadow },
        ]

        p.background(0);
        p.noStroke();

        p.drawStars(40, themes[theme].primary, 0, 300, 4, 7);

        // sun count is either 1 or 2
        var sunCount = Math.floor(p.random(1, 3));
        p.drawStars(sunCount, themes[theme].primary, 0, 100, 35, 65);

        for (let i = 0; i < shapes.length; i++) {
            const { yLocation, color } = shapes[i];
            const shadowConfig = shadows[i];
            shapeHeight = p.random(30, 50);

            const shadow = new Shadow(
                shadowConfig.mean,
                shadowConfig.std,
                shadowConfig.pointCount,
                shadowConfig.jiggle,
                shadowConfig.verticalSpacing,
                shadowConfig.strokeWeight,
                shadowConfig.color,
                yLocation,
                shapeHeight
            );

            const dune = new SandDune(yLocation, shapeHeight, color, shadow);

            let offset = p.random(0, 100);
            dune.draw(p, offset);
        }
        p.fill(0);
    }

    p.draw = function () {
        theme = themeSelect.value;
        console.log(`Drawing with theme: ${theme}`);
        p.drawCover(theme);
    }
}

new p5(sketch, 'p5-container');
