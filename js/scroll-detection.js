// Init the masterScrollPos variable, getting how far the top of the window is from the top of the page
var masterScrollPos = window.scrollY,
  // Init scrollElements array
  scrollElements = [],
  // For debugging, select the info element so you can see how far you are from the top
  info = $(".info"),
  // Next is the window height
  windowHeight = $(window).innerHeight();

// An object constructor for each of your elements. It contains...
function TransitionElem(element, correction) {
  // a jQuery object of the element,
  (this.elem = element),
  // its computed height as a number,
  (this.height = $(element).outerHeight()),
  // as well as a custom offset in in pixels, increase if you want the change of the object to happen later.
  (this.scrollCorrection = correction),
  // Also, get this element's position from the top of the page
  (this.pos = $(element).offset()),
  // Find out if the data-reset attribute exists, and set this prop to true if so. This allows us to reset the transition on an item if the user scrolls back up then down.
  (this.reset = typeof $(element).attr("data-reset") !==
   typeof undefined && $(element).attr("data-reset") !== false ?
   true : false),
  // lets find out if the data-reset attribute exists, and set the prop as true or false.
   (this.reverse = typeof $(element).attr("data-reverse") !==
   typeof undefined && $(element).attr("data-reverse") !== false ?
   true : false),
  // lets add a counter to keep track of how many times the function runs on this item. For the reset logic, and possibly some future features. Set it to 0 to start.
  (this.inCounter = 0);
}

// Adding the transition function as a prototype method of the TransitionElem class
TransitionElem.prototype = {
  elementEval: function(direction) {
    /* Setup the first argument, take the window height, add it to the masterScrollPos which is how far the top of the window is from the top of the page, and you get a reference to the bottom of the window. Add a third of your element's height (this makes sure at least a third of the element is showing before the tranistion starts), then subtract scrollCorrection value you specified. This tells the element when to start transitioning. */
    let bottomOfVPOffset =
      windowHeight + masterScrollPos + this.height / 3 - this.scrollCorrection,
      // Second argument is simply how far the top of your element is from the top of the page.
      elementTop = this.pos.top,
      // next is setting the bottom of the elements bottom
      elementBottom = this.pos.top + this.height,
      // To set the top of the Viewport plus our offset...
      topOfVPOffset = masterScrollPos + this.height / 3 - this.scrollCorrection,
    // Lets cache some object references to make them run a bit faster
    counter = this.inCounter,
    reset = this.reset,
    reverse = this.reverse;
    // IF the element's position is greater than or equal to the master scroll position AND is less than the bottom of the windows position, then we know at least a third of our element is inside the viewport! We're also making sure the transition hasn't already run (the counter is 0). OR if we manually send in the direction "in", OR IF all of the orginal things are true, AND the reset attribute exists.
    if (
      direction === "in" ||
      (elementTop >= topOfVPOffset &&
        elementTop <= bottomOfVPOffset &&
        counter < 1) ||
      (elementTop >= topOfVPOffset && elementTop <= bottomOfVPOffset && (reset === true || reverse === true))
    ) {
      // We could do a lot of things here, but let's just add a class and do the rest of our animations in CSS/Sass. We'll remove our initial out class and increment our counter.
      $(this.elem).addClass("element-in");
      $(this.elem).removeClass("element-out");
      this.inCounter++;
    }
    // This is kind of a reset. IF we manually send in the direction OUT, or IF the object is outside the viewport AND it has the reset data attribute AND reverse is set to false, then we'll take out our in class and add back our out class, so this element can be transitioned again.
    else if (
      direction === "out" ||
      (elementTop > topOfVPOffset && elementTop > bottomOfVPOffset && (reset === true || reverse === true)) ||
          // let's see if this has reverse, we'll want to run element out only if it comes back into the viewport while scrolling up
      (elementBottom > topOfVPOffset && counter > 0 && reset === false && reverse === true)
    ) {
      $(this.elem).addClass("element-out");
      $(this.elem).removeClass("element-in");
    }
  }
};

// Let's run some things on document ready
$(document).ready(function() {
  // update the debugger
  info.html(masterScrollPos);

  // For every element you've placed a data-scroll attribute on, create a new Object using the above constructor. Push that to the scrollElements array.
  $("[data-scrollin]").each(function(index, element) {
    let dataOffset = $(this).attr("data-scroll-offset");
    let newObj = new TransitionElem(element, dataOffset ? dataOffset : 0);
    scrollElements.push(newObj);

    // if the element is positioned less than the window height plus the window scroll position, then it's in the viewport onload, so run the elementIn function right now!
    if (
      newObj.pos.top < windowHeight + masterScrollPos &&
      newObj.pos.top > masterScrollPos
    ) {
      newObj.elementEval("in");
    } else if (
      newObj.pos.top > masterScrollPos &&
      newObj.pos.top < masterScrollPos + windowHeight
    ) {
      newObj.elementEval("in");
    } else if (newObj.pos.top < masterScrollPos) {
      newObj.elementEval("out");
    } else {
      newObj.elementEval("out");
    }
  });
});

/* This function will run whenever the window size changes, so we can re-compute the height and top position of our elements (just in case they're responsive). It has a timeout, so it will wait until the user is done resizing. */
window.setTimeout(function() {
  $(window).resize(function() {
    windowHeight = $(window).innerHeight();

    for (
      var i = 0, scrollElementslength = scrollElements.length;
      i < scrollElementslength;
      i++
    ) {
      scrollElements[i].pos = $(scrollElements[i].elem).offset();
      scrollElements[i].height = $(scrollElements[i].elem).outerHeight();
      if (scrollElements[i].pos.top < windowHeight) {
        scrollElements[i].elementEval();
      }
    }
  });
}, 300);

// The scroll event listener. The function inside will run on every scrolled pixel.
$(document).on("scroll", window, function() {
  // On each scroll, update how far we are from the top.
  masterScrollPos = window.scrollY;
  console.log(masterScrollPos)
  // Update the debugger
  info.html(masterScrollPos);

  // Run our method on each element in our scrollElements array
  for (
    var i = 0, scrollElementslength = scrollElements.length;
    i < scrollElementslength;
    i++
  ) {
    scrollElements[i].elementEval();
  }
});
