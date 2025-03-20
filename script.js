const moods = document.querySelectorAll(".mood");
const askAboutMoodContainer = document.querySelector(
  ".ask-about-mood-container"
);
const submitBtn = document.querySelector(".submitBtn");
const selectedMoodList = [];

let count = Number(localStorage.getItem("count")) || 0;

// add functionality of moods
moods.forEach((moods) => {
  moods.addEventListener("click", function (e) {
    // toggling selected mood class on click of mood.
    this.classList.toggle("selected-mood");
    let innerText = this.innerText.split(" ")[0]; // using split to remove emoji

    // pushing selected moods to array
    if (this.classList.contains("selected-mood")) {
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
  newDiv.classList.add(innerText);
  newDiv.innerHTML = `
    <label>Reason behind <b>${innerText}</b> mood:</label>
    <input type="text"
        name="about-mood-input"
        class="about-mood-input"
        placeholder="Write about mood" autocomplete="off" required>
  `;

  askAboutMoodContainer.appendChild(newDiv);
}

// remove functionality of ask about mood
function removeAskAboutMood(innerText) {
  document.querySelector(`.${innerText}`).remove();
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

let date = new Date();

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
function getTodayHistory() {
  let tempCount = count - 1;
  let num = 7; // number of history to display

  const storageObjectList = [];

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

  return storageObjectList; // return last six submissions of today
}

// display today's history
function displayTodayHistory() {
  const todayHistory = getTodayHistory();
  const todayHistoryContainer = document.querySelector(".today-history tbody");

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
function displayLast5History() {
  const last5History = getTodayHistory();
  const last5HistoryContainer = document.querySelector(".last5-history tbody");

  // display history in table format
  last5History.forEach((history) => {
    let moodList = history.moodList.join(", ");
    const newTr = document.createElement("tr");
    newTr.innerHTML = ` 
          <td>${history.date}</td>
          <td>${history.time}</td>
          <td>${moodList}</td>
          <td>${history.aboutMood}</td>
          <td>${history.thoughts || "-"}</td>
    `;
    last5HistoryContainer.appendChild(newTr);
  });
}

// display on page load
document.addEventListener("DOMContentLoaded", (event) => {
  displayTodayHistory();
  displayLast5History();
});
