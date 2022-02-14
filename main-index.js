"use strict";

// |
// |
// |
// +++ ( 0 ) +++
// >>> initial varriables & values ---
// ---
const bodyEl = document.body,
  scrollSpeed = 130, // The actual scroll speed
  BtnScrollerRange = 450, // The range of the scroll value of middle mouse button's function
  ArrowBtnScrollSpeed = 130, // The scroll speed of the arrow
  scrollerObjs = [], // All the scroller container element's Objects are stored here
  lastcurrentActiveScrollerObjs = []; // The history of all previous active scrollerObj

let scrollContEls = document.querySelectorAll(".parentScrollContainer"), // The container elements
  btnScrollAnimator = undefined, // The Interval scroll animator function's varriable
  btnMousePosition = [0, 0], // The mouse position when middle mouse button is pressing
  wheelBtnPressing = false, // Is middle mouse button pressing - condition
  mainActiveScrollerObj = undefined, // The main active scrollerObj
  currentActiveScrollerObj = undefined, // The current active scrollerObj that changes by some events
  passedActiveScrollerEl = 0, // The counter of how much objs are passed from the main -> current active scrollerObj
  activeScrollerThumb = undefined, // The ditection of the thumb when it is trigering the pointer down event
  activeThumbAxis = undefined, // The ditection of the axis of the activeScrollerThumb
  ScrollBtnsHeight = undefined, // The addition of scrollbar's 2 button's height
  activeScrollerPassTimer = undefined, // The Timeout current active Obj changer function's varriable
  isTuching = false; // The detection of the touch event, is touching or not
// ---
// >>> initial varriables & values ---

// |
// |
// |
// +++ ( 1 ) +++
// >>> Creating the initial elements inside parent Elements -----------
// ---
for (let indx = 0; indx < scrollContEls.length; indx++) {
  const scrollpageEls = scrollContEls[indx].innerHTML,
    scrollpageContainerEls = `
    <div class="scrollpageContainer">
      <div class="scrollpage">
      ${scrollpageEls}
      </div>
    </div>
    <div class="scrollbarContainer barY">
      <div class="arrow up"></div>
      <div class="thumbContainer">
        <div class="thumb"></div>
      </div>
      <div class="arrow down"></div>
    </div>
    <div class="scrollbarContainer barX">
      <div class="arrow left"></div>
      <div class="thumbContainer">
        <div class="thumb"></div>
      </div>
      <div class="arrow right"></div>
    </div>`;

  scrollContEls[indx].innerHTML = scrollpageContainerEls;
  // (!) Reselect the parent scroll elements again for geting the nesting elements. Because, -
  //     if a container is nested in another scroll container, the varriable lost that path of -
  //     the element after rearrange the container's elements
  scrollContEls = document.querySelectorAll(".parentScrollContainer");
}
// Geting the addition height of the scrollbar's buttons
ScrollBtnsHeight = scrollContEls[0].children[1].children[0].clientHeight * 2;
// ---
// >>> Creating the initial elements inside parent Elements -----------

// |
// |
// |
// +++ ( 2 ) +++
// >>> The height calculator functions -----------
// ---

// The scroll page scrollable height calculator of the both X & Y axis
// |
const scrollableHeightCalc = function () {
  this.scrollableHeight[0] =
    this.scrollpage.clientWidth - this.scrollpageContainer.clientWidth;
  this.scrollableHeight[1] =
    this.scrollpage.clientHeight - this.scrollpageContainer.clientHeight;
};

// The scroll bar scrollable height calculator of the both X & Y axis
// |
const scrollbarHeightCalc = function (scrollbar, indx) {
  let scrollbarAxis, heightOrWidth, scrollbarContMeasure;
  // Geting the index and initiazile the bar axix's initial values
  if (indx === 0) {
    scrollbarAxis = "X";
    heightOrWidth = "width";
    scrollbarContMeasure = "clientWidth";
  } else {
    scrollbarAxis = "Y";
    heightOrWidth = "height";
    scrollbarContMeasure = "clientHeight";
  }
  // measuring the height and width of scrollbar & scrollbar container
  let scrollbarContHeightOrWidth = scrollbar.container[scrollbarContMeasure],
    thumbHeightOrWidth =
      Math.round(
        scrollbarContHeightOrWidth /
          (this.scrollpage[scrollbarContMeasure] / scrollbarContHeightOrWidth)
      ) + ScrollBtnsHeight;

  // Condition - If the container should have scrollbar or not accrrding to scrollable height
  if (thumbHeightOrWidth < scrollbarContHeightOrWidth) {
    // Seting the thumd height or width to 40 it it is less than 40
    if (thumbHeightOrWidth > 40)
      scrollbar.thumbHeightOrWidth = thumbHeightOrWidth;
    else scrollbar.thumbHeightOrWidth = 40;
    // Remove the hider class if it exist
    if (this.containerEl.classList.contains("hideScrollbar" + scrollbarAxis)) {
      this.containerEl.classList.remove("hideScrollbar" + scrollbarAxis);
      this.mainScrollbarIndx[indx] = true;
    }

    // Calculating the scrollbar scrollable height
    let scrollbarScrollableHeight =
      scrollbarContHeightOrWidth - scrollbar.thumbHeightOrWidth;
    scrollbar.thumbScrollableHeight = scrollbarScrollableHeight;
    // Calculating the move ratio between scrollbar thumb & page
    this.scrollbarMoveRatio[indx] = (
      this.scrollableHeight[indx] / scrollbarScrollableHeight
    ).toFixed(2);
    // Updating the scrollbar thumb height or width
    scrollbar.thumb.style[heightOrWidth] = scrollbar.thumbHeightOrWidth + "px";
  } else {
    // Seting the thumd height or width to scrollbarContHeightOrWidth
    scrollbar.thumbHeightOrWidth = scrollbarContHeightOrWidth;
    // Add the hider class if it does not exist
    if (!this.containerEl.classList.contains("hideScrollbar" + scrollbarAxis)) {
      this.containerEl.classList.add("hideScrollbar" + scrollbarAxis);
      this.mainScrollbarIndx[indx] = false;
    }
  }
};
// ---
// >>> The height calculator functions -----------

// |
// |
// |
// +++ ( 3 ) +++
// >>> The Scrolling related functions -----------
// ---

// It will handle the Current Obj Changer function -----------
// |
const currentObjChanger = (
  notCallCurrentObj,
  isTuching,
  mainScrollvalue,
  indx
) => {
  // if scrollerCont = body & notCallCurrentObj is true, it should not change the Obj
  if (
    !notCallCurrentObj &&
    currentActiveScrollerObj !== scrollerObjs[0] &&
    btnScrollAnimator === undefined
  ) {
    // Condition - If it is not a touch event
    if (!isTuching) {
      // Make the activeScrollerPassTimer default in every scroll
      currentObjChangerCancel();
      // Set the timer
      activeScrollerPassTimer = setTimeout(() => {
        changeCurrentObj();
        // Make it default
        activeScrollerPassTimer = undefined;
      }, 450);
    } else {
      // Change the current obj
      changeCurrentObj();
      // Set the scroller event on that obj to move that
      scroller(mainScrollvalue, indx, false, true);
      // Make it default
      passedActiveScrollerEl = 0;
      currentActiveScrollerObj = mainActiveScrollerObj;
    }
  }
};

// It will make the activeScrollerPassTimer default -----------
// |
const currentObjChangerCancel = () => {
  if (activeScrollerPassTimer !== undefined) {
    clearTimeout(activeScrollerPassTimer);
    activeScrollerPassTimer = undefined;
  }
};

// It will change the currentActiveScrollerObj varriable -----------
// |
const changeCurrentObj = () => {
  // Getting the value of how much obj passed away
  passedActiveScrollerEl += 1;
  // Then change the obj according to passedActiveScrollerEl
  currentActiveScrollerObj =
    lastcurrentActiveScrollerObjs[
      lastcurrentActiveScrollerObjs.length - passedActiveScrollerEl
    ];
};

// The main scroller function -----------
// |
const scroller = function (scrollValue, indx, notCallCurrentObj, isTuching) {
  let mainScrollvalue = scrollValue; // Store the main scroll value for call the scroller function again if needed

  // Condition - If the container has scrollbar X or Y or both
  if (
    currentActiveScrollerObj.mainScrollbarIndx[0] ||
    currentActiveScrollerObj.mainScrollbarIndx[1]
  ) {
    scrollValue =
      currentActiveScrollerObj.scrollPosition[indx] + mainScrollvalue; // Updating scrollvalue with adding scrollPosition of current Obj
    let scrollableHeight = currentActiveScrollerObj.scrollableHeight[indx]; // Get the scrollableHeight

    // Condition - Rather this scrollbar has the scrollableHeight in correct number or not
    if (scrollableHeight > 0) {
      // Changing the scrollPosition according the three condition of scrollValue
      if (scrollValue < 0) {
        currentActiveScrollerObj.scrollPosition[indx] = 0;
        currentObjChanger(notCallCurrentObj, isTuching, mainScrollvalue, indx);
      } else if (scrollValue > scrollableHeight) {
        currentActiveScrollerObj.scrollPosition[indx] = scrollableHeight;
        currentObjChanger(notCallCurrentObj, isTuching, mainScrollvalue, indx);
      } else {
        currentActiveScrollerObj.scrollPosition[indx] = scrollValue;
        currentObjChangerCancel();
      }
      // Update the scrollpage & scrollbar's position
      currentActiveScrollerObj.scrollpage.style.transform = `translate(${-currentActiveScrollerObj
        .scrollPosition[0]}px, ${-currentActiveScrollerObj
        .scrollPosition[1]}px)`;
      scrollbarThumbMover.call(currentActiveScrollerObj, indx);
    }
  } else if (currentActiveScrollerObj !== scrollerObjs[0]) {
    // Condition - If scrollerCont not = body || For those scroll parent elements but it does not have nay scrollbar
    // Condition - If anykind of animation is off and this is not tuch event || For the wheel event
    if (btnScrollAnimator === undefined && !isTuching) changeCurrentObj();
    else if (btnScrollAnimator === undefined && isTuching) {
      // || For the touch event
      changeCurrentObj();
      // Set the scroller event on that obj to move that
      scroller(mainScrollvalue, indx, false, true);
      // Make that default again
      passedActiveScrollerEl = 0;
      currentActiveScrollerObj = mainActiveScrollerObj;
    }
    // || for middle mouse button
    // It occurs Error - when move the mouse very fast in mouse out event
    //  else if (btnScrollAnimator !== undefined && !isTuching)
    //   changeCurrentObj();
  }
};

// It moves the scrollbar thumb -----------
// |
const scrollbarThumbMover = function (indx) {
  // Calculating the scroll value of thumb
  let theValue = Math.round(
    this.scrollPosition[indx] / this.scrollbarMoveRatio[indx]
  );

  // Changing the scrollThumbPosition according the three condition of theValue
  if (theValue > this.scrollbars[indx].thumbScrollableHeight)
    this.scrollThumbPosition[indx] =
      this.scrollbars[indx].thumbScrollableHeight;
  else if (theValue < 0) this.scrollThumbPosition[indx] = 0;
  else this.scrollThumbPosition[indx] = theValue;

  // Update the scrollbar's position according to the axis
  this.scrollbars[indx].thumb.style.transform = `translate${
    indx === 0 ? "X" : "Y"
  }(${this.scrollThumbPosition[indx]}px)`;
};

// It moves the page according to the thumb's position -----------
// |
const pageMoverByThumb = function (indx) {
  // Update the scrollPosition according to the scrollThumbPosition
  currentActiveScrollerObj.scrollPosition[indx] =
    currentActiveScrollerObj.scrollThumbPosition[indx] *
    currentActiveScrollerObj.scrollbarMoveRatio[indx];

  // Update the scroll page's position according to the thumb's position
  currentActiveScrollerObj.scrollpage.style.transform = `translate(${-currentActiveScrollerObj
    .scrollPosition[0]}px, ${-currentActiveScrollerObj.scrollPosition[1]}px)`;
};

// It deactives the active scroller thumb -----------
// |
const deactivateScrollerThumb = (doNotChangeCurrentObj) => {
  // Condition - If the activeScrollerThumb is not undefined
  if (activeScrollerThumb !== undefined) {
    activeScrollerThumb.thumb.classList.remove("activeThumb");
    currentActiveScrollerObj.scrollpage.classList.remove("activeThumbPage");
    bodyEl.classList.remove("activeThumbBody");
    activeScrollerThumb = undefined;
  }
  if (!doNotChangeCurrentObj) currentActiveScrollerObj = mainActiveScrollerObj;
};
// ---
// >>> The Scrolling related functions -----------

// |
// |
// |
// +++ ( 4 ) +++
// >>> Prepairing the scrollerObjs and initialization -----------
// ---

// This will initialize the containerEl, make an Obj & add it to the scrollerObjs
// ||
const addScrlContObj = (containerEl) => {
  // Making the obj
  const theObj = {
    containerEl,
    scrollpageContainer: containerEl.children[0],
    scrollpage: containerEl.children[0].firstElementChild,
    scrollableHeight: [0, 0],
    scrollbars: [
      {
        container: containerEl.children[2].children[1],
        thumb: containerEl.children[2].children[1].firstElementChild,
        arrows: [
          containerEl.children[2].children[0],
          containerEl.children[2].children[2],
        ],
        thumbHeightOrWidth: undefined,
        thumbScrollableHeight: undefined,
      },
      {
        container: containerEl.children[1].children[1],
        thumb: containerEl.children[1].children[1].firstElementChild,
        arrows: [
          containerEl.children[1].children[0],
          containerEl.children[1].children[2],
        ],
        thumbHeightOrWidth: undefined,
        thumbScrollableHeight: undefined,
      },
    ],
    scrollbarMoveRatio: [0, 0],
    scrollPosition: [0, 0],
    scrollThumbPosition: [0, 0],
    mainScrollbarIndx: [true, true],
  };

  // Calling the height calculators
  scrollableHeightCalc.call(theObj);
  scrollbarHeightCalc.call(theObj, theObj.scrollbars[0], 0);
  scrollbarHeightCalc.call(theObj, theObj.scrollbars[1], 1);
  // Add the obj to the scrollerObjs
  scrollerObjs.push(theObj);
};

// This loop will add some initial event to some element specificly
// ||
scrollContEls.forEach((containerEl, indx) => {
  addScrlContObj(containerEl); // Assigning this element in scrollerObjs

  // To detect the track and the active scroller object when pointer enter
  containerEl.addEventListener("pointerenter", () => {
    // If it is not the body element, it will add that obj to history (lastcurrentActiveScrollerObjs)
    if (indx !== 0) lastcurrentActiveScrollerObjs.push(mainActiveScrollerObj);
    // Adding that obj to the mainActiveScrollerObj
    mainActiveScrollerObj = scrollerObjs[indx];
    // Update the currentActiveScrollerObj if all condition is true
    if (!activeScrollerThumb && btnScrollAnimator === undefined && !isTuching) {
      currentActiveScrollerObj = mainActiveScrollerObj;
      currentObjChangerCancel();
    }
  });
  // To detect the track and the active scroller object when pointer out
  containerEl.addEventListener("pointerleave", () => {
    // Updating the mainActiveScrollerObj from the history (lastcurrentActiveScrollerObjs)
    mainActiveScrollerObj =
      lastcurrentActiveScrollerObjs.pop() || scrollerObjs[0];
    // Update the currentActiveScrollerObj if all condition is true
    if (!activeScrollerThumb && btnScrollAnimator === undefined && !isTuching) {
      currentObjChangerCancel();
      currentActiveScrollerObj = mainActiveScrollerObj;
      passedActiveScrollerEl = 0;
    }
  });

  // Add some initial event specificly to the each scrollbar and buttons
  scrollerObjs[indx].scrollbars.forEach((scrollbar, index) => {
    // To detect the active thumb
    scrollbar.thumb.addEventListener("pointerdown", () => {
      activeScrollerThumb = scrollbar;
      activeThumbAxis = index;
      // Adding the CSS class to the elements to be ready for pageMoverByThumb
      activeScrollerThumb.thumb.classList.add("activeThumb");
      currentActiveScrollerObj.scrollpage.classList.add("activeThumbPage");
      bodyEl.classList.add("activeThumbBody");
    });

    // Adding event to all buttons
    scrollbar.arrows.forEach((arrow, i) => {
      // It will scroll the page on pointerdown event
      arrow.addEventListener("pointerdown", () => {
        // Make the scrollValue according to poll index of scrollbar > up = 0, doun = 1, left = 0, right = 1
        let scrollValue = i === 0 ? -ArrowBtnScrollSpeed : ArrowBtnScrollSpeed;

        // For first itteration
        scroller(scrollValue, index, true);
        // Then the loop will runing
        btnScrollAnimator = setInterval(() => {
          scroller(scrollValue, index, true);
        }, 100);
      });
    });
  });
});

// Activating the initial elements
mainActiveScrollerObj = scrollerObjs[0];
currentActiveScrollerObj = mainActiveScrollerObj;
// ---
// >>> Prepairing the scrollerObjs and initialization -----------

// |
// |
// |
// +++ ( 5 ) +++
// >>> The resizer functions & events -----------
// ---

// This function will reassign the initial values on resizing the container element
// ||
const containerResizer = function () {
  // Get the tow value of scrollableHeight in an array
  let thisScrollableHeight = [...this.scrollableHeight];
  // ReInitialize the scrollableHeight
  scrollableHeightCalc.call(this);

  // For the both axis' scrollableHeight
  thisScrollableHeight.forEach((scrollableHeight, indx) => {
    // Checking is the scrollableHeight chenged or not
    if (scrollableHeight !== this.scrollableHeight[indx]) {
      // ReInitialize the height related values of scrollbar
      scrollbarHeightCalc.call(this, this.scrollbars[indx], indx);
      // Updating the position of scrollbar thumb
      scrollbarThumbMover.call(this, indx);
      // Update the scrollableHeight
      scrollableHeight = this.scrollableHeight[indx];

      if (scrollableHeight <= 0) this.scrollPosition[indx] = 0;
      // If the scrollableHeight is less than 0
      else if (this.scrollPosition[indx] > scrollableHeight)
        this.scrollPosition[indx] = scrollableHeight;
      // If the scrollPosition is bigger than scrollableHeight
      else if (this.scrollPosition[indx] < 0) this.scrollPosition[indx] = 0; // If the scrollPosition is less than 0

      // Updateing the page's position
      this.scrollpage.style.transform = `translate(${-this
        .scrollPosition[0]}px ,${-this.scrollPosition[1]}px)`;
    }
  });
};

// Calling the containerResizer function for all scrollerObjs on a animation loop
// ||
const resizer = () => {
  scrollerObjs.forEach((theObj) => containerResizer.call(theObj));
  requestAnimationFrame(resizer);
};
// Calling the resizer function
resizer();

// Calling the containerResizer function for all scrollerObjs on window resize event
// ||
window.addEventListener("resize", () => {
  scrollerObjs.forEach((theObj) => containerResizer.call(theObj));
});
// ---
// >>> The resizer function will reassign the initial values on resizing the container element -----------

// |
// |
// |
// +++ ( 6 ) +++
// >>> All the event listener functions that handle the scrolling -----------
// ---

// The wheel event
// ||
window.addEventListener("wheel", (theEvent) => {
  deactivateScrollerThumb(true); // Deactive the scrollber thumb if it is active

  // It will not work if the control key is pressing
  if (!theEvent.ctrlKey) {
    // Checking if the value is negative or not
    let scrollValue = theEvent.deltaY > 0 ? scrollSpeed : -scrollSpeed;

    // If the Y-axis scrollbar exists or not
    if (!currentActiveScrollerObj.mainScrollbarIndx[1]) {
      // Then it will simply call scroller function by only X-axis
      scroller(scrollValue, 0);
    } else {
      // If the shift Key is pressed or not
      if (theEvent.shiftKey) {
        scroller(scrollValue, 0);
      } else {
        scroller(scrollValue, 1);
      }
    }
  }
});

// The key event
// ||
window.addEventListener("keydown", (theEvent) => {
  deactivateScrollerThumb(true); // Deactive the scrollber thumb if it is active

  // If the shift & control key is not pressed
  if (!theEvent.shiftKey && !theEvent.ctrlKey) {
    // Calling the scroller function's value & axis according to the key
    if (theEvent.code === "ArrowUp") scroller(-scrollSpeed, 1);
    else if (theEvent.code === "ArrowDown") scroller(scrollSpeed, 1);
    else if (theEvent.code === "ArrowLeft") scroller(-scrollSpeed, 0);
    else if (theEvent.code === "ArrowRight") scroller(scrollSpeed, 0);
  }
});

// The pointer down event
// ||
window.addEventListener("pointerdown", (theEvent) => {
  // If the shift & control key is not pressed & the button is middle mouse button
  if (theEvent.button === 1 && !theEvent.shiftKey) {
    deactivateScrollerThumb(); // Deactive the scrollber thumb if it is active

    wheelBtnPressing = true; // Make the wheelBtnPressing condition true
    // Activating the interval of scroller in the btnScrollAnimator
    btnScrollAnimator = setInterval(() => {
      scroller(btnMousePosition[0], 0, true);
      scroller(btnMousePosition[1], 1, true);
    }, 100);
  }
  // Detecting the touch event
  if (theEvent.pointerType === "touch") isTuching = true;
});

// The pointer up event
// ||
window.addEventListener("pointerup", (theEvent) => {
  deactivateScrollerThumb(); // Deactive the scrollber thumb if it is active

  // If the button is middle mouse button
  if (theEvent.button === 1) {
    // Making the initial values default
    wheelBtnPressing = false;
    btnMousePosition[0] = 0;
    btnMousePosition[1] = 0;
  }
  // Make it default if btnScrollAnimator contains interval
  if (btnScrollAnimator !== undefined) {
    clearInterval(btnScrollAnimator);
    btnScrollAnimator = undefined;
  }
  // Make it default if it is a touch event
  if (isTuching) isTuching = false;
});

// The pointer move event
// ||
window.addEventListener("pointermove", (theEvent) => {
  // Make the initial values default if the conditions are true
  if (passedActiveScrollerEl > 0 && btnScrollAnimator === undefined) {
    currentActiveScrollerObj = mainActiveScrollerObj;
    passedActiveScrollerEl = 0;
    currentObjChangerCancel();
  }

  // If activeScrollerThumb is not undefined
  if (activeScrollerThumb !== undefined) {
    // Making some initial values
    let thumbScrollableHeight = activeScrollerThumb.thumbScrollableHeight,
      scrollbarAxis = activeThumbAxis === 0 ? "X" : "Y",
      thumbPosition =
        currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] +
        theEvent["movement" + scrollbarAxis];

    // Update scrollThumbPosition according to the three condition of thumbPosition
    if (thumbPosition > thumbScrollableHeight)
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] =
        thumbScrollableHeight;
    else if (thumbPosition < 0)
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] = 0;
    else
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] =
        thumbPosition;

    // Updating the thumb's position
    activeScrollerThumb.thumb.style.transform = `translate${scrollbarAxis}(${currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis]}px)`;
    // Updating the pages position by thumb
    pageMoverByThumb(activeThumbAxis);
  } else if (isTuching && btnScrollAnimator === undefined) {
    // Mainly if it is a touch event
    // Making the mouse position values
    let mousePosition = [
      Math.round(theEvent.movementX * 2),
      Math.round(theEvent.movementY * 2),
    ];
    // Calling the scroller function for both axis's mousePosition
    mousePosition.forEach((position, indx) => {
      scroller(-position, indx, false, true);
    });
  } else if (wheelBtnPressing === true) {
    // If the middle mouse button is pressed
    // Making the mouse position values
    let mousePosition = [
      btnMousePosition[0] + theEvent.movementX,
      btnMousePosition[1] + theEvent.movementY,
    ];
    // Seting the btnMousePosition's value for both axis's mousePosition
    mousePosition.forEach((position, indx) => {
      // Update the btnMousePosition if the position is under the BtnScrollerRange
      if (Math.abs(position) <= BtnScrollerRange)
        btnMousePosition[indx] = position;
    });
  }
});
// ---
// >>> All the event listener functions that handle the scrolling -----------

// ------------------ Alhamdulillah
// --- Simplifi code

// (!) --- Warnings ---
// It does not automatically detect the scroll container || You have to make that fixed
