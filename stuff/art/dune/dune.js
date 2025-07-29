let strumSlider, saveBtn;

// Array of shape configurations
let yellow_color = [222, 159, 66];
let red_color = [240, 90, 37];

let darker_red_color = [198, 56, 46]

const shapes = [
    { height: 0, strum: 10, color: red_color, increment: 0.0005 },
    { height: 200, strum: 9, color: yellow_color, increment: 0.001 },
    { height: 400, strum: 10, color: red_color, increment: 0.002 },
    { height: 600, strum: 9, color: yellow_color, increment: 0.003 },
    { height: 800, strum: 10, color: red_color, increment: 0.005 },
    { height: 1000, strum: 10, color: yellow_color, increment: 0.007 },
    { height: 1200, strum: 15, color: red_color, increment: 0.01 }
];

const shadows = [
    { mean: 0, std: 20, n: 100, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 4, x_sample_count: 100, color: darker_red_color },
    { mean: 200, std: 20, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
    { mean: 330, std: 35, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
    { mean: 450, std: 50, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
    { mean: 560, std: 50, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
    { mean: 700, std: 60, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
    { mean: 820, std: 50, n: 100, spacing: 8, limit: 15, y_limit_lower: 0, y_limit_upper: 800, strokeWeight: 2, color: darker_red_color },
]

// Initialize offsets randomly
let offsets = Array.from({ length: shapes.length }, () => Math.random() * 1000);

function sketch(p) {
    p.setup = function () {
        p5canvas = p.createCanvas(600, 800);
        strumSlider = document.getElementById('strumSlider');

        saveBtn = document.getElementById('saveBtn');

        saveBtn.addEventListener('click', () => {
            let link = document.createElement('a');
            link.download = 'dune_art.png';
            link.href = p5canvas.elt.toDataURL();
            link.click();
        });

        var numbers = p.drawNRandomNumbers(900, 100, 200);
        p.noLoop(); // Prevent continuous drawing
        p.background(240);

        let spacing = 8;
        let limit = 15;

        // draw points
        for (let k = 0; k < 100; k++) {
            let x = k * spacing; // Adjust spacing between points
            for (let i = 0; i < numbers.length; i++) {
                let y = numbers[i]; // Map to canvas height
                let randomOFfset = p.random(-limit, limit); // Random offset for each point
                y += randomOFfset; // Apply the random offset
                p.stroke(0);
                p.strokeWeight(4);
                p.point(x, y);
            }
        }
    };

    p.drawShadowPlane = function (
        mean,
        std,
        n,
        spacing,
        limit,
        y_limit_lower,
        y_limit_upper,
        strokeWeight,
        x_sample_count,
        color = [0, 0, 0]
    ) {
        p.stroke(...color);
        p.strokeWeight(strokeWeight);
        p.noFill();

        // Generate random numbers
        var numbers = p.drawNRandomNumbers(mean, std, n);

        // Draw points with random offsets
        for (let k = 0; k < x_sample_count; k++) {
            let x = k * spacing; // Adjust spacing between points
            for (let i = 0; i < numbers.length; i++) {
                let y = numbers[i]; // Map to canvas height
                let randomOFfset = p.random(-limit, limit); // Random offset for each point
                y += randomOFfset; // Apply the random offset

                if (y > y_limit_upper && y < y_limit_lower) {
                    p.point(x, y);
                }
            }
        }
    }

    p.drawShadowLine = function (
        mean,
        std,
        n,
        x,
        limit,
        y_limit_lower,
        y_limit_upper,
        strokeWeight,
        color = [0, 0, 0]
    ) {
        p.stroke(...color);
        p.strokeWeight(strokeWeight);
        p.noFill();

        // Generate random numbers
        var numbers = p.drawNRandomNumbers(mean, std, n);
        var points = [];

        // Draw points with random offsets
        for (let i = 0; i < numbers.length; i++) {
            let y = numbers[i]; // Map to canvas height
            let randomOFfset = p.random(-limit, limit); // Random offset for each point
            y += randomOFfset; // Apply the random offset

            console.log(`x: ${x}, y: ${y}, randomOffset: ${randomOFfset} y_limit_upper: ${y_limit_upper}, y_limit_lower: ${y_limit_lower}`);

            if (y > y_limit_upper + 30) {
                points.push([x, y]);
                // p.point(x, y);
                // console.log(`Drawing point at x: ${x}, y: ${y} with offset: ${randomOFfset}`);
            }
        }

        return points;

    }

    p.drawShape = function (color, height, strum, offset, index) {
        
        p.beginShape();
        p.noStroke();
        p.vertex(0, p.height);
        var allShadowPoints = [];
        for (let x = 0; x < p.width; x++) {
            let angle = offset + x * 0.01;
            let y = p.map(p.sin(angle), -strum, strum, 0, height);
            // console.log(`x: ${x}, y: ${y}, offset: ${offset} p.sin(angle): ${p.sin(angle)}`);
            p.vertex(x, y);

            // draw shadow lines for each x value. use the index to determine which shadow to draw.
            if (index < shadows.length) {
                const shadow = shadows[index];
                var shadowPoints = p.drawShadowLine(
                    shadow.mean,
                    shadow.std,
                    shadow.n,
                    x,
                    shadow.limit,
                    height,
                    y,
                    shadow.strokeWeight,
                    shadow.color
                );
                allShadowPoints.push(...shadowPoints);
            }
        }
        p.vertex(p.width, p.height);
        p.fill(...color);
        // p.strokeWeight(2);
        // p.stroke(0);
        p.noStroke();
        p.endShape();

        // Draw shadow points
        if (index < shadows.length) {
            const shadow = shadows[index];
            p.stroke(...shadow.color);
            p.strokeWeight(shadow.strokeWeight);
            p.noFill();
            for (let point of allShadowPoints) {
                p.point(point[0], point[1]);
                
            }
        }
    }

    p.drawStars = function (count, color = [255, 255, 255], y_limit_lower, y_limit_upper, size_lower_limit = 2, size_upper_limit = 5) {
        // should draw n circles between y_limit_lower and y_limit_upper
        p.fill(...color);
        p.noStroke();
        let drawnCount = 0;
        while (drawnCount < count) {
            console.log(`drawnCount: ${drawnCount}, count: ${count}`);
            let x = p.random(p.width);
            let y = p.random(y_limit_lower, y_limit_upper);
            if (y > y_limit_upper || y < y_limit_lower) {
                continue; // Skip if outside the limits
            }
            let size = p.random(size_lower_limit, size_upper_limit);
            p.ellipse(x, y, size, size);
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

    p.draw = function () {
        strum = parseFloat(strumSlider.value);
        p.background(0);
        p.drawStars(25, yellow_color, 0, 100, 4, 7);
        // sun count is either 1 or 2
        var sunCount = Math.floor(p.random(1, 3));
        p.drawStars(sunCount, yellow_color, 0, 100, 35, 65);
        p.noStroke();

        for (let i = 1; i < 7; i++) {
            const { height, strum: shapeStrum, color, increment } = shapes[i];
            p.drawShape(color, height, shapeStrum, offsets[i], i);
            offsets[i] += increment;
        }
        p.fill(0);

    }
}

new p5(sketch, 'p5-container');
