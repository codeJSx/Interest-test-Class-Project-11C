document.addEventListener("DOMContentLoaded", () => {
    const jsonPath = "questions.json"; // Pfad zur JSON-Datei
    console.log("Laden der JSON-Datei gestartet.");

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error("JSON-Datei konnte nicht geladen werden");
            }
            console.log("JSON-Datei erfolgreich geladen.");
            return response.json();
        })
        .then(data => {
            console.log("JSON-Daten:", data);
            insertQuestions(data);
        })
        .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));
});

function insertQuestions(data) {
    const mainDiv = document.getElementById("main");
    console.log("Verarbeite Kategorien aus JSON.");

    const allBoxes = []; // Speichert Referenzen zu allen Boxen

    // Gehe durch jede Kategorie in der JSON
    Object.keys(data).forEach((categoryId) => {
        const categoryData = data[categoryId];
        console.log(`Kategorie ID: ${categoryId}`, categoryData);

        const groupDiv = document.createElement("div");
        groupDiv.className = "group";

        const groupTitle = document.createElement("h1");
        groupTitle.id = `group_title_${categoryId}`;
        groupTitle.textContent = categoryData.title;
        groupDiv.appendChild(groupTitle);

        // Erstelle die Frageboxen
        categoryData.questions.forEach((question, index) => {
            console.log(`Frage ${index + 1} in Kategorie ${categoryId}:`, question);

            const boxDiv = document.createElement("div");
            boxDiv.className = "box";

            // Klick-Event für die Box
            boxDiv.addEventListener("click", () => {
                console.log(`Kasten ${question.id_all} angeklickt.`);
                updateBoxStyles(-1, allBoxes.indexOf(boxDiv), allBoxes);
            });

            const questionHeader = document.createElement("h1");
            questionHeader.id = `question-${question.id_all}`;
            questionHeader.textContent = question.text;
            boxDiv.appendChild(questionHeader);

            const subtitlesDiv = document.createElement("div");
            subtitlesDiv.className = "untertitles";

            const titleParagraph = document.createElement("p");
            titleParagraph.id = `title-${question.id_all}`;
            titleParagraph.className = "untertitle";
            titleParagraph.textContent = categoryData.title;

            const groupParagraph = document.createElement("p");
            groupParagraph.id = `group-${question.id_all}`;
            groupParagraph.className = "untertitle";
            groupParagraph.textContent = categoryData.group;

            const valueIdParagraph = document.createElement("p");
            valueIdParagraph.id = `value-${question.value}_id-${question.id_all}_id-${question.id_cat}`;
            valueIdParagraph.className = "untertitle_id";
            valueIdParagraph.textContent = `V${question.value}-ID${question.id_all}-ID#${question.id_cat}`;

            const hr = document.createElement("hr");

            subtitlesDiv.appendChild(titleParagraph);
            subtitlesDiv.appendChild(groupParagraph);
            subtitlesDiv.appendChild(valueIdParagraph);
            subtitlesDiv.appendChild(hr);
            boxDiv.appendChild(subtitlesDiv);

            const form = document.createElement("form");
            const fieldset = document.createElement("fieldset");

            ["Trifft nicht zu", "Trifft selten zu", "Trifft teilweise zu", "Trifft voll zu"].forEach((labelText, value) => {
                const input = document.createElement("input");
                input.type = "radio";
                input.id = `question-${question.id_all}-option-${value + 1}`;
                input.name = `question-${question.id_all}`;
                input.value = value + 1;

                const label = document.createElement("label");
                label.htmlFor = input.id;
                label.textContent = labelText;

                fieldset.appendChild(input);
                fieldset.appendChild(label);
            });

            form.appendChild(fieldset);
            boxDiv.appendChild(form);

            const nextButton = document.createElement("button");
            nextButton.className = "button";
            nextButton.textContent = "Nächste Frage";
            nextButton.setAttribute("data-index", allBoxes.length);

            // Klick-Event für den Button
            nextButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const currentIndex = parseInt(event.target.getAttribute("data-index"));
                const nextIndex = currentIndex + 1;

                // Prüfen, ob es der letzte Kasten ist
                if (currentIndex === allBoxes.length - 1) {
                    console.log("Test abschließen Button geklickt.");
                    finishTest(); // Funktion zum Abschließen des Tests
                } else {
                    console.log(`Button in Kasten ${currentIndex + 1} geklickt.`);
                    updateBoxStyles(currentIndex, nextIndex, allBoxes);
                }
            });

            boxDiv.appendChild(nextButton);
            groupDiv.appendChild(boxDiv);
            allBoxes.push(boxDiv); // Füge die Box zur globalen Liste hinzu
        });

        mainDiv.appendChild(groupDiv);
        console.log(`Kategorie ${categoryId} erfolgreich hinzugefügt.`);
    });

    // Passe den Text des letzten Buttons an
    if (allBoxes.length > 0) {
        const lastBox = allBoxes[allBoxes.length - 1];
        const lastButton = lastBox.querySelector(".button");
        if (lastButton) {
            lastButton.textContent = "Test abschließen";
        }
    }

    // Setze die erste Box aktiv
    updateBoxStyles(-1, 0, allBoxes);
}

function updateBoxStyles(previousIndex, currentIndex, allBoxes) {
    console.log(`Aktualisiere Kastenstile: PreviousIndex=${previousIndex}, CurrentIndex=${currentIndex}`);
    allBoxes.forEach((box, index) => {
        if (index === currentIndex) {
            console.log(`Markiere Kasten ${index + 1} als aktiv.`);
            box.style.opacity = "1";
        } else {
            console.log(`Markiere Kasten ${index + 1} als inaktiv.`);
            box.style.opacity = "0.3";
        }
    });

    if (currentIndex >= 0 && allBoxes[currentIndex]) {
        console.log(`Scrolle zu Kasten ${currentIndex + 1}.`);
        allBoxes[currentIndex].scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

function finishTest() {
    console.log("Test abgeschlossen. Antworten werden gesammelt und gespeichert.");

    const answersByCategory = {};

    const allQuestions = document.querySelectorAll(".box");

    allQuestions.forEach((box) => {
        const questionHeader = box.querySelector("h1").textContent; // Die Frage
        const valueIdText = box.querySelector(".untertitle_id").textContent; // "V<Value>-ID<All>-ID#<Cat>"
        const titleText = box.querySelector(".untertitle").textContent; // Kategorie Titel
        const selectedOption = box.querySelector("input[type='radio']:checked"); // Gewählte Option

        if (selectedOption) {
            // Extrahiere Details aus der ID
            const [value, idAll, idCat] = valueIdText
                .match(/V(\d+)-ID(\d+)-ID#(\d+)/)
                .slice(1, 4)
                .map(Number);

            // Wenn die Kategorie noch nicht existiert, initialisiere sie
            if (!answersByCategory[titleText]) {
                answersByCategory[titleText] = [];
            }

            // Füge die Antwort zur richtigen Kategorie hinzu
            answersByCategory[titleText].push({
                question: questionHeader,
                selectedValue: parseInt(selectedOption.value),
                idAll: idAll,
                idCat: idCat,
            });
        } else {
            console.warn(`Keine Option für Frage "${questionHeader}" ausgewählt.`);
        }
    });

    console.log("Gesammelte Antworten nach Kategorien:", answersByCategory);

    // JSON erstellen und als Datei herunterladen
    const jsonData = JSON.stringify(answersByCategory, null, 4);
    const blob = new Blob([jsonData], { type: "application/json" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "test_results_by_category.json";
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log("JSON-Datei wurde heruntergeladen.");
    alert("Test erfolgreich abgeschlossen! Die Antworten wurden gespeichert.");
}

// Dev Tests
function randomizeAnswers() {
    console.log("Zufällige Antworten werden für jede Frage ausgewählt.");

    const allQuestions = document.querySelectorAll(".box");

    allQuestions.forEach((box) => {
        // Wähle eine zufällige Option (zwischen 1 und 4)
        const randomOption = Math.floor(Math.random() * 4) + 1;

        // Suche das Radio-Button-Element, das der zufälligen Option entspricht
        const radioOption = box.querySelector(`input[type="radio"][value="${randomOption}"]`);

        // Wenn eine gültige Option gefunden wird, setze sie als ausgewählt
        if (radioOption) {
            radioOption.checked = true;
            console.log(`Für die Frage "${box.querySelector("h1").textContent}" wurde die Option ${randomOption} gewählt.`);
        }
    });
}