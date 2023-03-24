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
const noMoreString = document.querySelector(".no-more");
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
// for website rendering
CurDate.textContent = `Date: ${day} ${monthNumber[month]} ${year}`;

// page load and displaying the flights(Initialization)
window.addEventListener("load", function () {
  getFlightComponent(arrival, loadMore);
});

switchBtn.addEventListener("click", function () {
  removeOrAddBtn(true);
  myToggle();
  getFlightComponent(arrival, loadMore);
  removeFlightsContainer(arrival);
});

loadEarlyBtn.addEventListener("click", function (e) {
  e.preventDefault();
  removeFlightsContainer(!arrival);
  loadEarly = true;
  getFlightComponent(arrival, loadMore, loadEarly);
  loadEarlyBtn.style.display = "none";
});

loadMoreBtn.addEventListener("click", function (e) {
  e.preventDefault();
  removeFlightsContainer(!arrival);
  loadMore = true;
  getFlightComponent(arrival, loadMore, loadEarly);
  removeOrAddBtn(false);
});

// true for add, false for remove
const removeOrAddBtn = function (add) {
  if (add) {
    loadMoreBtn.style.display = "block";
    loadEarlyBtn.style.display = "block";
    noMoreString.classList.add("hidden");
  } else {
    loadMoreBtn.style.display = "none";
    noMoreString.classList.remove("hidden");
  }
};

const myToggle = function () {
  arrival = !arrival;
  loadEarly = false;
  loadMore = false;
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

const airportInfoString = function (codes) {
  let airportInfo = "";
  codes.forEach((code) => {
    for (const data of iataArray) {
      if (data.iata_code === code)
        airportInfo += `${data.municipality}&nbsp;(${data.name})<br>`;
    }
  });
  return airportInfo;
};

const displayFlight = function (arrival, list) {
  let flightNumberStr = "";
  list.flight.forEach((flt) => {
    flightNumberStr +=
      flt.no.split(" ").join("&nbsp") + "&nbsp;&nbsp;&nbsp;&#32;";
  });
  if (arrival) {
    const airportInfo = airportInfoString(list.origin);
    aHtml = `
    <div class="flight-component"> 
      <div class="flight-no"><span class="bold">Flight No.:</span> <span>${flightNumberStr}</span></div>
      <div class="time"><span class="bold">Schedule Time:</span> <span>${list.time}</span></div>
      <div class="airport origin"><span class="bold">Origin (Airport):</span><br>${airportInfo}</div>
      <div class="flight-data"><span class="bold">Parking Stand:</span>&nbsp;${list.stand}&nbsp;&nbsp;&nbsp;&#32<span class="bold">Hall:</span>&nbsp;${list.hall}&nbsp;&nbsp;&nbsp;&#32<span class="bold">Belt:</span>&nbsp;${list.baggage}</div>
      <div class="status"><span class="bold">Status:</span>&nbsp;<span>${list.status}</span></div>
    </div>  `;
    arrFlightsContainer.insertAdjacentHTML("beforeend", aHtml);
  } else {
    const airportInfo = airportInfoString(list.destination);
    dHtml = `
    <div class="flight-component"> 
      <div class="flight-no"><span class="bold">Flight No.:</span> ${flightNumberStr}</div>
      <div class="time"><span class="bold">Schedule Time:</span> ${list.time}</div>
      <div class="airport destination"><span class="bold">Destination (Airport):</span><br>${airportInfo}</div>
      <div class="flight-data"><span class="bold">Terminal:</span>&nbsp;${list.terminal}&nbsp;&nbsp;&nbsp;&#32<span class="bold">Aisle:</span>&nbsp;${list.aisle}&nbsp;&nbsp;&nbsp;&#32<span class="bold">Gate:</span>&nbsp;${list.gate} </div>
      <div class="status"><span class="bold">Status:</span>&nbsp;${list.status} </div>
    </div>  `;
    deptFlightsContainer.insertAdjacentHTML("beforeend", dHtml);
  }
};

// only fetch iata.json once to improve performance
const getAirportPromise = async function () {
  const response = await fetch("iata.json");
  const dataArray = await response.json();
  return dataArray;
};
// use IIFE to store the data form iata.json
let iataArray;
(async function () {
  iataArray = await getAirportPromise();
  console.log(iataArray);
})();

let count = 0;
// main function
const getFlightComponent = function (isArrival, isLoadMore, isLoadEarly) {
  fetch(
    `flight.php?date=${dateString}&lang=en&cargo=false&arrival=${isArrival}`
  )
    .then((response) => response.json())
    .then((data) => {
      let dayBeforeData;
      let onDayData;
      if (data.length == 2) {
        [dayBeforeData, onDayData] = data;
        console.log(dayBeforeData);
        console.log(onDayData);
      } else if (data.length == 1) onDayData = data[0];
      // append the day before flights first
      if (dayBeforeData && isLoadEarly) {
        dayBeforeData.list.forEach((schedule) => {
          displayFlight(isArrival, schedule);
        });
      }
      for (const schedule of onDayData.list) {
        const hourMin = schedule.time.split(":");
        // 10 current flight based on current time;
        if (
          (+hourMin[0] >= hour && +hourMin[1] >= min) ||
          (+hourMin[0] > hour && +hourMin[1] <= min)
        ) {
          if (!isLoadMore && count < 10) {
            displayFlight(isArrival, schedule);
            count++;
          } else if (isLoadMore) {
            displayFlight(isArrival, schedule);
          }
        } else {
          // display from the start of on day flight to the real time flights
          if (isLoadEarly) displayFlight(isArrival, schedule);
        }
      }
      // when flights number is less than 10, no loadMore button
      if (count < 10) removeOrAddBtn(false);
      count = 0;
    });
};
