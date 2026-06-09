const URL = "https://teachablemachine.withgoogle.com/models/d8LOj2Rrm/";

let model, webcam, labelContainer, maxPredictions;

async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container")
        .appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");

    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    // find highest confidence index
    let highestIndex = 0;
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > prediction[highestIndex].probability) {
            highestIndex = i;
        }
    }

    for (let i = 0; i < maxPredictions; i++) {

        const className = prediction[i].className;
        const probability = prediction[i].probability;
        const percent = (probability * 100).toFixed(2);

        const isTop = i === highestIndex;

        labelContainer.childNodes[i].innerHTML = `
            <div class="label-card ${isTop ? "active" : ""}">
                <div class="label-header">
                    <span>${className}</span>
                    <span class="percent">${percent}%</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill ${getColorClass(percent)}"
                        style="width:${percent}%">
                    </div>
                </div>
            </div>
        `;
    }
}

// optional color logic
function getColorClass(percent) {
    if (percent > 75) return "high";
    if (percent > 40) return "medium";
    return "low";
}