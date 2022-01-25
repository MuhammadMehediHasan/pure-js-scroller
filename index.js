"use strict";

const bodyEl = document.body,
  scrollSpeed = 130,
  BtnScrollerRange = 450,
  ArrowBtnScrollSpeed = 130,
  scrollerObjs = [],
  lastcurrentActiveScrollerObjs = [];

let scrollContEls = document.querySelectorAll(".parentScrollContainer"),
  btnScrollAnimator = undefined,
  btnMousePosition = [0, 0],
  wheelBtnPressing = false,
  mainActiveScrollerObj = undefined,
  currentActiveScrollerObj = undefined,
  passedActiveScrollerEl = 0,
  activeScrollerThumb = undefined,
  activeThumbAxis = undefined,
  ScrollBtnsHeight = undefined,
  activeScrollerPassTimer = undefined,
  isTuching = false;

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
  scrollContEls = document.querySelectorAll(".parentScrollContainer");
}
ScrollBtnsHeight = scrollContEls[0].children[1].children[0].clientHeight * 2;

const scrollableHeightCalc = function () {
  this.scrollableHeight[0] =
    this.scrollpage.clientWidth - this.scrollpageContainer.clientWidth;
  this.scrollableHeight[1] =
    this.scrollpage.clientHeight - this.scrollpageContainer.clientHeight;
};

const scrollbarHeightCalc = function (scrollbar, indx) {
  let scrollbarAxis, heightOrWidth, scrollbarContMeasure;
  if (indx === 0) {
    scrollbarAxis = "X";
    heightOrWidth = "width";
    scrollbarContMeasure = "clientWidth";
  } else {
    scrollbarAxis = "Y";
    heightOrWidth = "height";
    scrollbarContMeasure = "clientHeight";
  }
  let scrollbarContHeightOrWidth = scrollbar.container[scrollbarContMeasure],
    thumbHeightOrWidth =
      Math.round(
        scrollbarContHeightOrWidth /
          (this.scrollpage[scrollbarContMeasure] / scrollbarContHeightOrWidth)
      ) + ScrollBtnsHeight;

  if (thumbHeightOrWidth < scrollbarContHeightOrWidth) {
    if (thumbHeightOrWidth > 40)
      scrollbar.thumbHeightOrWidth = thumbHeightOrWidth;
    else scrollbar.thumbHeightOrWidth = 40;
    if (this.containerEl.classList.contains("hideScrollbar" + scrollbarAxis)) {
      this.containerEl.classList.remove("hideScrollbar" + scrollbarAxis);
      this.mainScrollbarIndx[indx] = true;
    }

    let scrollbarScrollableHeight =
      scrollbarContHeightOrWidth - scrollbar.thumbHeightOrWidth;
    scrollbar.thumbScrollableHeight = scrollbarScrollableHeight;
    this.scrollbarMoveRatio[indx] = (
      this.scrollableHeight[indx] / scrollbarScrollableHeight
    ).toFixed(2);
    scrollbar.thumb.style[heightOrWidth] = scrollbar.thumbHeightOrWidth + "px";
  } else {
    scrollbar.thumbHeightOrWidth = scrollbarContHeightOrWidth;
    if (!this.containerEl.classList.contains("hideScrollbar" + scrollbarAxis)) {
      this.containerEl.classList.add("hideScrollbar" + scrollbarAxis);
      this.mainScrollbarIndx[indx] = false;
    }
  }
};

const currentObjChanger = (
  notCallCurrentObj,
  isTuching,
  mainScrollvalue,
  indx
) => {
  if (
    !notCallCurrentObj &&
    currentActiveScrollerObj !== scrollerObjs[0] &&
    btnScrollAnimator === undefined
  ) {
    if (!isTuching) {
      currentObjChangerCancel();
      activeScrollerPassTimer = setTimeout(() => {
        changeCurrentObj();
        activeScrollerPassTimer = undefined;
      }, 450);
    } else {
      changeCurrentObj();
      scroller(mainScrollvalue, indx, false, true);
      passedActiveScrollerEl = 0;
      currentActiveScrollerObj = mainActiveScrollerObj;
    }
  }
};

const currentObjChangerCancel = () => {
  if (activeScrollerPassTimer !== undefined) {
    clearTimeout(activeScrollerPassTimer);
    activeScrollerPassTimer = undefined;
  }
};

const changeCurrentObj = () => {
  passedActiveScrollerEl += 1;
  currentActiveScrollerObj =
    lastcurrentActiveScrollerObjs[
      lastcurrentActiveScrollerObjs.length - passedActiveScrollerEl
    ];
};

const scroller = function (scrollValue, indx, notCallCurrentObj, isTuching) {
  let mainScrollvalue = scrollValue;

  if (
    currentActiveScrollerObj.mainScrollbarIndx[0] ||
    currentActiveScrollerObj.mainScrollbarIndx[1]
  ) {
    scrollValue =
      currentActiveScrollerObj.scrollPosition[indx] + mainScrollvalue;
    let scrollableHeight = currentActiveScrollerObj.scrollableHeight[indx];

    if (scrollableHeight > 0) {
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
      currentActiveScrollerObj.scrollpage.style.transform = `translate(${-currentActiveScrollerObj
        .scrollPosition[0]}px, ${-currentActiveScrollerObj
        .scrollPosition[1]}px)`;
      scrollbarThumbMover.call(currentActiveScrollerObj, indx);
    }
  } else if (currentActiveScrollerObj !== scrollerObjs[0]) {
    if (btnScrollAnimator === undefined && !isTuching) changeCurrentObj();
    else if (btnScrollAnimator === undefined && isTuching) {
      changeCurrentObj();
      scroller(mainScrollvalue, indx, false, true);
      passedActiveScrollerEl = 0;
      currentActiveScrollerObj = mainActiveScrollerObj;
    }
    //  else if (btnScrollAnimator !== undefined && !isTuching)
    //   changeCurrentObj();
  }
};

const scrollbarThumbMover = function (indx) {
  let theValue = Math.round(
    this.scrollPosition[indx] / this.scrollbarMoveRatio[indx]
  );

  if (theValue > this.scrollbars[indx].thumbScrollableHeight)
    this.scrollThumbPosition[indx] =
      this.scrollbars[indx].thumbScrollableHeight;
  else if (theValue < 0) this.scrollThumbPosition[indx] = 0;
  else this.scrollThumbPosition[indx] = theValue;

  this.scrollbars[indx].thumb.style.transform = `translate${
    indx === 0 ? "X" : "Y"
  }(${this.scrollThumbPosition[indx]}px)`;
};

const pageMoverByThumb = function (indx) {
  currentActiveScrollerObj.scrollPosition[indx] =
    currentActiveScrollerObj.scrollThumbPosition[indx] *
    currentActiveScrollerObj.scrollbarMoveRatio[indx];

  currentActiveScrollerObj.scrollpage.style.transform = `translate(${-currentActiveScrollerObj
    .scrollPosition[0]}px, ${-currentActiveScrollerObj.scrollPosition[1]}px)`;
};

const deactivateScrollerThumb = (doNotChangeCurrentObj) => {
  if (activeScrollerThumb !== undefined) {
    activeScrollerThumb.thumb.classList.remove("activeThumb");
    currentActiveScrollerObj.scrollpage.classList.remove("activeThumbPage");
    bodyEl.classList.remove("activeThumbBody");
    activeScrollerThumb = undefined;
  }
  if (!doNotChangeCurrentObj) currentActiveScrollerObj = mainActiveScrollerObj;
};

const addScrlContObj = (containerEl) => {
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

  scrollableHeightCalc.call(theObj);
  scrollbarHeightCalc.call(theObj, theObj.scrollbars[0], 0);
  scrollbarHeightCalc.call(theObj, theObj.scrollbars[1], 1);
  scrollerObjs.push(theObj);
};

scrollContEls.forEach((containerEl, indx) => {
  addScrlContObj(containerEl);

  containerEl.addEventListener("pointerenter", () => {
    if (indx !== 0) lastcurrentActiveScrollerObjs.push(mainActiveScrollerObj);
    mainActiveScrollerObj = scrollerObjs[indx];
    if (!activeScrollerThumb && btnScrollAnimator === undefined && !isTuching) {
      currentActiveScrollerObj = mainActiveScrollerObj;
      currentObjChangerCancel();
    }
  });
  containerEl.addEventListener("pointerleave", () => {
    mainActiveScrollerObj =
      lastcurrentActiveScrollerObjs.pop() || scrollerObjs[0];
    if (!activeScrollerThumb && btnScrollAnimator === undefined && !isTuching) {
      currentObjChangerCancel();
      currentActiveScrollerObj = mainActiveScrollerObj;
      passedActiveScrollerEl = 0;
    }
  });

  scrollerObjs[indx].scrollbars.forEach((scrollbar, index) => {
    scrollbar.thumb.addEventListener("pointerdown", () => {
      activeScrollerThumb = scrollbar;
      activeThumbAxis = index;
      activeScrollerThumb.thumb.classList.add("activeThumb");
      currentActiveScrollerObj.scrollpage.classList.add("activeThumbPage");
      bodyEl.classList.add("activeThumbBody");
    });

    scrollbar.arrows.forEach((arrow, i) => {
      arrow.addEventListener("pointerdown", () => {
        let scrollValue = i === 0 ? -ArrowBtnScrollSpeed : ArrowBtnScrollSpeed;

        scroller(scrollValue, index, true);
        btnScrollAnimator = setInterval(() => {
          scroller(scrollValue, index, true);
        }, 100);
      });
    });
  });
});

mainActiveScrollerObj = scrollerObjs[0];
currentActiveScrollerObj = mainActiveScrollerObj;

const containerResizer = function () {
  let thisScrollableHeight = [...this.scrollableHeight];
  scrollableHeightCalc.call(this);

  thisScrollableHeight.forEach((scrollableHeight, indx) => {
    if (scrollableHeight !== this.scrollableHeight[indx]) {
      scrollbarHeightCalc.call(this, this.scrollbars[indx], indx);
      scrollbarThumbMover.call(this, indx);
      scrollableHeight = this.scrollableHeight[indx];

      if (scrollableHeight <= 0) this.scrollPosition[indx] = 0;
      else if (this.scrollPosition[indx] > scrollableHeight)
        this.scrollPosition[indx] = scrollableHeight;
      else if (this.scrollPosition[indx] < 0) this.scrollPosition[indx] = 0;

      this.scrollpage.style.transform = `translate(${-this
        .scrollPosition[0]}px ,${-this.scrollPosition[1]}px)`;
    }
  });
};

const resizer = () => {
  scrollerObjs.forEach((theObj) => containerResizer.call(theObj));
  requestAnimationFrame(resizer);
};
resizer();

window.addEventListener("resize", () => {
  scrollerObjs.forEach((theObj) => containerResizer.call(theObj));
});

window.addEventListener("wheel", (theEvent) => {
  deactivateScrollerThumb(true);

  if (!theEvent.ctrlKey) {
    let scrollValue = theEvent.deltaY > 0 ? scrollSpeed : -scrollSpeed;

    if (!currentActiveScrollerObj.mainScrollbarIndx[1]) {
      scroller(scrollValue, 0);
    } else {
      if (theEvent.shiftKey) {
        scroller(scrollValue, 0);
      } else {
        scroller(scrollValue, 1);
      }
    }
  }
});

window.addEventListener("keydown", (theEvent) => {
  deactivateScrollerThumb(true);

  if (!theEvent.shiftKey && !theEvent.ctrlKey) {
    if (theEvent.code === "ArrowUp") scroller(-scrollSpeed, 1);
    else if (theEvent.code === "ArrowDown") scroller(scrollSpeed, 1);
    else if (theEvent.code === "ArrowLeft") scroller(-scrollSpeed, 0);
    else if (theEvent.code === "ArrowRight") scroller(scrollSpeed, 0);
  }
});

window.addEventListener("pointerdown", (theEvent) => {
  if (theEvent.button === 1 && !theEvent.shiftKey) {
    deactivateScrollerThumb();

    wheelBtnPressing = true;
    btnScrollAnimator = setInterval(() => {
      scroller(btnMousePosition[0], 0, true);
      scroller(btnMousePosition[1], 1, true);
    }, 100);
  }
  if (theEvent.pointerType === "touch") isTuching = true;
});

window.addEventListener("pointerup", (theEvent) => {
  deactivateScrollerThumb();

  if (theEvent.button === 1) {
    wheelBtnPressing = false;
    btnMousePosition[0] = 0;
    btnMousePosition[1] = 0;
  }
  if (btnScrollAnimator !== undefined) {
    clearInterval(btnScrollAnimator);
    btnScrollAnimator = undefined;
  }
  if (isTuching) isTuching = false;
});

window.addEventListener("pointermove", (theEvent) => {
  if (passedActiveScrollerEl > 0 && btnScrollAnimator === undefined) {
    currentActiveScrollerObj = mainActiveScrollerObj;
    passedActiveScrollerEl = 0;
    currentObjChangerCancel();
  }

  if (activeScrollerThumb !== undefined) {
    let thumbScrollableHeight = activeScrollerThumb.thumbScrollableHeight,
      scrollbarAxis = activeThumbAxis === 0 ? "X" : "Y",
      thumbPosition =
        currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] +
        theEvent["movement" + scrollbarAxis];

    if (thumbPosition > thumbScrollableHeight)
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] =
        thumbScrollableHeight;
    else if (thumbPosition < 0)
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] = 0;
    else
      currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis] =
        thumbPosition;

    activeScrollerThumb.thumb.style.transform = `translate${scrollbarAxis}(${currentActiveScrollerObj.scrollThumbPosition[activeThumbAxis]}px)`;
    pageMoverByThumb(activeThumbAxis);
  } else if (isTuching && btnScrollAnimator === undefined) {
    let mousePosition = [
      Math.round(theEvent.movementX * 1.5),
      Math.round(theEvent.movementY * 1.5),
    ];
    mousePosition.forEach((position, indx) => {
      scroller(-position, indx, false, true);
    });
  } else if (wheelBtnPressing === true) {
    let mousePosition = [
      btnMousePosition[0] + theEvent.movementX,
      btnMousePosition[1] + theEvent.movementY,
    ];
    mousePosition.forEach((position, indx) => {
      if (Math.abs(position) <= BtnScrollerRange)
        btnMousePosition[indx] = position;
    });
  }
});
// ------------------ Alhamdulillah

// (!) --- Warnings ---
// It does not automatically detect the scroll container || You have to make that fixed
