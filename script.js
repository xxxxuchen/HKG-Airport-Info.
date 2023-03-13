"use strict";

const CurDate = document.querySelector(".current-date");
const dept = document.querySelector(".dept");
const arr = document.querySelector(".arr");
const switchBtn = document.querySelector(".switch-btn");
const deptInfo = document.querySelector(".dp-info");
const arrInfo = document.querySelector(".ar-info");
const deptFlightsContainer = document.querySelector(
  ".departure-flights-container"
);
const arrFlightsContainer = document.querySelector(
  ".arrival-flights-container"
);
let flightComponent = document.querySelector(".flight-component");
const loadEarlyBtn = document.querySelector(".load-early");
const loadMoreBtn = document.querySelector(".load-more");

var monthNumber = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "Sempteper",
  "October",
  "November",
  "December",
];
let aHtml = "";
let dHtml = "";
let arrival = false;
let loadMore = false;
let loadEarly = false;
const now = new Date();
const day = now.getDate();
const month = now.getMonth();
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();

// for query string
const dateString = `${year}-${month + 1}-${day}`;
CurDate.textContent = `Date: ${day} ${monthNumber[month]} ${year}`;

//load while displaying the flights(Initialization page)
window.addEventListener("load", function () {
  getFlightComponent(arrival, loadMore);
});

switchBtn.addEventListener("click", function () {
  loadMoreBtn.style.display = "block";
  myToggle();
  getFlightComponent(arrival, loadMore);
  removeFlightsContainer(arrival);
});

loadEarlyBtn.addEventListener("click", function () {});
loadMoreBtn.addEventListener("click", function () {
  removeFlightsContainer(!arrival);
  loadMore = true;
  getFlightComponent(arrival, loadMore);
  loadMore = false;
  loadMoreBtn.style.display = "none";
});

const myToggle = function () {
  // console.log("switching");
  arrival = !arrival;

  dept.classList.toggle("decoration");
  arr.classList.toggle("decoration");
  deptInfo.classList.toggle("hidden");
  arrInfo.classList.toggle("hidden");
};

const removeFlightsContainer = function (arr) {
  if (arr) {
    while (deptFlightsContainer.hasChildNodes()) {
      deptFlightsContainer.removeChild(deptFlightsContainer.firstChild);
    }
  } else {
    while (arrFlightsContainer.hasChildNodes()) {
      arrFlightsContainer.removeChild(arrFlightsContainer.firstChild);
    }
  }
};

const displayFlight = function (arrival, list) {
  let flightNumberStr = "";
  list.flight.forEach((flt) => {
    flightNumberStr +=
      flt.no.split(" ").join("&nbsp") + "&nbsp;&nbsp;&nbsp;&#32;";
  });
  if (arrival) {
    aHtml = `
    <div class="flight-component"> 
      <div class="flight-no">Flight No.: <span>${flightNumberStr}</span></div>
      <div class="time">Schedule Time: <span>${list.time}</span></div>
      <div class="airport">Origin (Airport):<span></span></div>
      <div class="flight-data">Parking Stand: ${list.stand}&nbsp;&nbsp;&nbsp;&#32Hall:${list.hall}&nbsp;&nbsp;&nbsp;&#32Belt:${list.baggage}</div>
      <div class="status">Status: <span>${list.status}</span></div>
    </div>  `;
    arrFlightsContainer.insertAdjacentHTML("beforeend", aHtml);
  } else {
    dHtml = `
    <div class="flight-component"> 
      <div class="flight-no">Flight No.: ${flightNumberStr}</div>
      <div class="time">Schedule Time: ${list.time}</div>
      <div class="airport">Destination (Airport):</div>
      <div class="flight-data">Terminal: ${list.terminal}&nbsp;&nbsp;&nbsp;&#32Aisle:${list.aisle}&nbsp;&nbsp;&nbsp;&#32Gate:${list.gate} </div>
      <div class="status">Status: ${list.status} </div>
    </div>  `;
    deptFlightsContainer.insertAdjacentHTML("beforeend", dHtml);
  }
};

let count = 0;
const getFlightComponent = function (isArrival, isLoadMore, isLoadEarly) {
  fetch(
    `flight.php?date=${dateString}&lang=en&cargo=false&arrival=${isArrival}`
  )
    .then((response) => response.json())
    .then((data) => {
      const [dayBeforeData, onDayData] = data;
      console.log(dayBeforeData);
      console.log(onDayData);
      for (const schedule of onDayData.list) {
        const hourMin = schedule.time.split(":");
        // 10 current flight based on current time;
        if (
          (hour <= +hourMin[0] && min <= +hourMin[1]) ||
          (hour <= +hourMin[0] && min >= +hourMin[1])
        ) {
          if (!isLoadMore && count < 10) {
            displayFlight(isArrival, schedule);
            count++;
          } else if (isLoadMore) {
            displayFlight(isArrival, schedule);
          } else if (isLoadEarly) {
          }
        }
      }
      if (count < 10) {
        loadMoreBtn.style.display = "none";
      }
      count = 0;
      aHtml = "";
      dHtml = "";
    });
};

// fetch("flight.php?date=2023-03-11&lang=en&cargo=false&arrival=false")
//   .then((response) => response.json())
//   .then((data) => {
//     console.log(data);
//     const [onDayData] = data;
//     console.log(onDayData);
//     for (const schedule of onDayData.list) {
//       const hourMin = schedule.time.split(":");
//       // 10 current dat;
//       if (hour <= +hourMin[0] && min <= +hourMin[1]) {
//         console.log(schedule.time);
//       }
//     }
//   });
