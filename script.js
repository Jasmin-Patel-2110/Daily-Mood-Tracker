const moods = document.querySelectorAll(".mood");
const askAboutMoodContainer = document.querySelector(
  ".ask-about-mood-container"
);
const submitBtn = document.querySelector(".submitBtn");
let count = Number(localStorage.getItem("count")) || 0;

let date = new Date();

const selectedMoodList = [];

// add functionality of moods
moods.forEach((mood) => {
  mood.addEventListener("click", function (e) {
    e.preventDefault();

    // toggling selected mood class on click of mood.
    this.classList.toggle("selected-mood");
    let innerText = this.innerText.trim(); // using split to remove emoji

    // pushing selected moods to array
    if (this.classList.contains("selected-mood")) {
      if (selectedMoodList.length > 2) {
        this.classList.remove("selected-mood");
        alert("Select only 3 moods...");
        return;
      }
      selectedMoodList.push(innerText);
      addAskAboutMood(innerText);
    } else {
      removeAskAboutMood(innerText);
      selectedMoodList.pop(innerText);
    }
  });
});

// add functionality of ask about mood
function addAskAboutMood(innerText) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("about-mood");
  newDiv.classList.add(innerText.split(" ")[0]); // using split to remove emoji
  newDiv.innerHTML = `
    <label>Reason behind <b>${innerText}</b> mood:</label>
    <input type="text"
        name="about-mood-input"
        class="about-mood-input"
        placeholder="Write about mood" autocomplete="off" required>
  `;

  setTimeout(() => {
    newDiv.classList.add("show");
  }, 0);

  askAboutMoodContainer.appendChild(newDiv);
}

// remove functionality of ask about mood
function removeAskAboutMood(innerText) {
  document.querySelector(`.${innerText.split(" ")[0]}`).remove(); // using split to remove emoji
}

// add functionality of submit button
submitBtn.addEventListener("click", () => {
  const allAboutMoodInput = document.querySelectorAll(".about-mood-input");
  const thoughts = document.querySelector(".thoughts").value;

  // validation
  if (selectedMoodList.length <= 0) {
    alert("Select Your Mood...");
    return;
  }

  let aboutMood = [];
  // pushing all about mood inputs
  allAboutMoodInput.forEach(function (element) {
    aboutMood.push(`${element.value}`);
  });

  // validation
  if (aboutMood == "") {
    alert("Write down reason behind selected mood...");
    return;
  }

  // saving to local storage
  saveToLocalStorage(aboutMood, thoughts);
  window.location.reload();

  // reset
  allAboutMoodInput.forEach(function (element) {
    element.value = "";
  });
  document.querySelector(".thoughts").value = "";
});

// saving to local storage
function saveToLocalStorage(aboutMood, thoughts) {
  let currentTime = date.toLocaleTimeString();
  let currentDate = date.toLocaleDateString();

  // creating storage object
  const storageObject = {
    moodList: [...selectedMoodList],
    aboutMood: [...aboutMood],
    thoughts: thoughts,
    time: currentTime,
    date: currentDate,
  };

  // saving
  localStorage.setItem(count, JSON.stringify(storageObject));
  localStorage.setItem("count", ++count);
}

// get today's history
function getHistory(option) {
  let tempCount = count - 1;
  const storageObjectList = [];

  if (option === "today") {
    let num = 7; // number of history to display + 1

    // get last six submissions if date matches today
    for (
      tempCount = count - 1;
      tempCount > count - num && tempCount >= 0;
      tempCount--
    ) {
      let storageObject = JSON.parse(localStorage.getItem(tempCount));

      if (!storageObject) {
        num++;
        continue;
      }
      // if date matches today then push
      if (storageObject.date === date.toLocaleDateString()) {
        storageObjectList.push(storageObject);
      }
    }
  } else if (option === "previous") {
    // get last 5 submissions
    let num = 9; // number of history to display + 1

    for (
      tempCount = count - 1;
      tempCount > count - num && tempCount >= 0;
      tempCount--
    ) {
      let storageObject = JSON.parse(localStorage.getItem(tempCount));

      if (!storageObject) {
        num++;
        continue;
      }

      storageObjectList.push(storageObject);
    }
  }

  return storageObjectList; // return last six submissions of today
}

// display today's history
function displayTodayHistory() {
  const todayHistory = getHistory("today");
  const todayHistoryContainer = document.querySelector(".today-history tbody");

  if (todayHistory.length === 0) {
    const newTr = document.createElement("tr");
    newTr.innerHTML = ` 
          <td colspan="4">No History</td>
      `;

    todayHistoryContainer.appendChild(newTr);
  }

  // display history in table format
  todayHistory.forEach((history) => {
    let moodList = history.moodList.join(", ");
    const newTr = document.createElement("tr");
    newTr.innerHTML = ` 
          <td>${history.time}</td>
          <td>${moodList}</td>
          <td>${history.aboutMood}</td>
          <td>${history.thoughts || "-"}</td>
    `;
    todayHistoryContainer.appendChild(newTr);

    // if more than 5 then add "more..." to last row
    if (todayHistoryContainer.childElementCount > 5) {
      todayHistoryContainer.removeChild(todayHistoryContainer.lastElementChild);
      const newTr = document.createElement("tr");
      newTr.innerHTML = ` 
          <td colspan="4">more...</td>
    `;

      todayHistoryContainer.appendChild(newTr);
    }
  });
}

// display last 5 history
function displayPreviousHistory() {
  const previousHistory = getHistory("previous");

  const previousHistoryContainer = document.querySelector(
    ".previous-history tbody"
  );

  if (previousHistory.length === 0) {
    const newTr = document.createElement("tr");
    newTr.innerHTML = ` 
          <td colspan="4">No History</td>
      `;

    previousHistoryContainer.appendChild(newTr);
  }

  // display history in table format
  previousHistory.forEach((history) => {
    let moodList = history.moodList.join(", ");
    const newTr = document.createElement("tr");
    newTr.innerHTML = ` 
          <td>${history.date}</td>
          <td>${history.time}</td>
          <td>${moodList}</td>
          <td>${history.aboutMood}</td>
          <td>${history.thoughts || "-"}</td>
    `;
    previousHistoryContainer.appendChild(newTr);
  });
}

// Download Button
const downloadBtn = document.querySelector(".downloadBtn");

// Excel Download Function
downloadBtn.addEventListener("click", () => {
  const allData = getAllDataFromLocalStorage();

  if (allData.length === 0) {
    alert("No history available to download.");
    return;
  }

  // Create Worksheet and Workbook
  const ws = XLSX.utils.json_to_sheet(allData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mood History");

  // Download Excel File
  XLSX.writeFile(wb, `Mood_History_${date.toLocaleDateString()}.xlsx`);
});

// Fetch all data from localStorage
function getAllDataFromLocalStorage() {
  let allData = [];
  let tempCount = count;

  for (let i = 0; i < tempCount; i++) {
    let storageObject = JSON.parse(localStorage.getItem(i));

    if (storageObject) {
      allData.push({
        Date: storageObject.date,
        Time: storageObject.time,
        Mood: storageObject.moodList.join(", "),
        Reason: storageObject.aboutMood.join(", "),
        Thoughts: storageObject.thoughts || "-",
      });
    }
  }

  return allData;
}

// Clear History Button
const clearHistoryBtn = document.querySelector(".clear-history-btn");

clearHistoryBtn.addEventListener("click", () => {
  const confirmation = confirm("Are you sure you want to clear history?");

  if (!confirmation) {
    return;
  }
  localStorage.clear();
  location.reload();
});

// display on page load
document.addEventListener("DOMContentLoaded", (event) => {
  displayTodayHistory();
  displayPreviousHistory();
});
