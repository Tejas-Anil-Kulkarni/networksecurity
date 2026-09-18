
const fileInput =
    document.getElementById("fileInput");

const dropArea =
    document.getElementById("dropArea");

const fileName =
    document.getElementById("fileName");

const predictionForm =
    document.getElementById("predictionForm");

const predictBtn =
    document.getElementById("predictBtn");

const trainBtn =
    document.getElementById("trainBtn");

const resultsContainer =
    document.getElementById("resultsContainer");

const resultCount =
    document.getElementById("resultCount");

const toast =
    document.getElementById("toast");



/* =========================================
   TOAST
========================================= */

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.className =
        "toast show " + type;

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}



/* =========================================
   FILE SELECTION
========================================= */

fileInput.addEventListener(
    "change",
    function () {

        if (this.files.length === 0) {
            return;
        }

        const file = this.files[0];

        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {

            fileInput.value = "";

            fileName.textContent = "";

            showToast(
                "Please select a CSV file.",
                "error"
            );

            return;
        }

        fileName.textContent =
            "Selected: " + file.name;

    }
);



/* =========================================
   DRAG ENTER / OVER
========================================= */

["dragenter", "dragover"].forEach(
    eventName => {

        dropArea.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropArea.classList.add(
                    "dragover"
                );

            }
        );

    }
);



/* =========================================
   DRAG LEAVE / DROP
========================================= */

["dragleave", "drop"].forEach(
    eventName => {

        dropArea.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropArea.classList.remove(
                    "dragover"
                );

            }
        );

    }
);



/* =========================================
   DROP FILE
========================================= */

dropArea.addEventListener(
    "drop",
    event => {

        const files =
            event.dataTransfer.files;

        if (files.length === 0) {
            return;
        }

        const file = files[0];

        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {

            showToast(
                "Only CSV files are supported.",
                "error"
            );

            return;
        }

        fileInput.files = files;

        fileName.textContent =
            "Selected: " + file.name;

    }
);



/* =========================================
   PREDICTION
========================================= */

predictionForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (fileInput.files.length === 0) {

            showToast(
                "Please select a CSV file first.",
                "error"
            );

            return;
        }


        const file =
            fileInput.files[0];


        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {

            showToast(
                "Only CSV files are supported.",
                "error"
            );

            return;
        }


        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );


        predictBtn.disabled = true;

        predictBtn.innerHTML =
            "Analyzing...";


        resultsContainer.innerHTML = `

            <div class="empty-state">

                <div
                    id="resultSpinner"
                    style="
                        width:25px;
                        height:25px;
                        border:2px solid rgba(255,255,255,.2);
                        border-top-color:#7c5cff;
                        border-radius:50%;
                        animation:spin .8s linear infinite;
                        margin-bottom:15px;
                    "
                ></div>

                <h3>
                    Running prediction
                </h3>

                <p>
                    Your network traffic is being analyzed...
                </p>

            </div>

        `;


        try {

            const response =
                await fetch(
                    "/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Prediction request failed."
                );

            }


            /*
             * FastAPI returns the HTML
             * generated by table.html.
             */

            const html =
                await response.text();


            resultsContainer.innerHTML =
                html;


            const table =
                resultsContainer
                    .querySelector("table");


            if (table) {

                const rows =
                    table.querySelectorAll(
                        "tbody tr"
                    );


                resultCount.textContent =
                    `${rows.length} records analyzed`;

            }
            else {

                resultCount.textContent =
                    "Analysis completed";

            }


            showToast(
                "Network analysis completed."
            );

        }
        catch (error) {

            console.error(error);


            resultsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠
                    </div>

                    <h3>
                        Prediction failed
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;


            resultCount.textContent =
                "Analysis failed";


            showToast(
                error.message,
                "error"
            );

        }
        finally {

            predictBtn.disabled =
                false;

            predictBtn.innerHTML =
                "Analyze Network Traffic <span>→</span>";

        }

    }
);



/* =========================================
   MODEL TRAINING
========================================= */

trainBtn.addEventListener(
    "click",
    async () => {

        const spinner =
            document.getElementById(
                "trainingSpinner"
            );

        const icon =
            document.getElementById(
                "trainingIcon"
            );

        const title =
            document.getElementById(
                "trainingTitle"
            );

        const message =
            document.getElementById(
                "trainingMessage"
            );


        trainBtn.disabled = true;

        trainBtn.innerHTML =
            "Training model...";


        spinner.style.display =
            "block";

        icon.style.display =
            "none";


        title.textContent =
            "Training in progress";


        message.textContent =
            "Running the complete ML pipeline...";


        try {

            const response =
                await fetch(
                    "/train",
                    {
                        method: "GET"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Training request failed."
                );

            }


            const result =
                await response.text();


            spinner.style.display =
                "none";


            icon.style.display =
                "block";

            icon.textContent =
                "✓";


            title.textContent =
                "Training completed";


            message.textContent =
                result;


            showToast(
                "Model training completed successfully."
            );

        }
        catch (error) {

            console.error(error);


            spinner.style.display =
                "none";


            icon.style.display =
                "block";

            icon.textContent =
                "×";


            title.textContent =
                "Training failed";


            message.textContent =
                error.message;


            showToast(
                "Model training failed.",
                "error"
            );

        }
        finally {

            trainBtn.disabled =
                false;

            trainBtn.innerHTML =
                "Start Training <span>→</span>";

        }

    }
);
