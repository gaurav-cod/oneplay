let prevExecutionTime = 0;

// Do tasks when gamepad is connected and running
const runGamepad = () => {
  let isButtonPressed = false;
  let currTime = new Date().getTime();

  if (currTime - prevExecutionTime < 200) {
    return;
  }

  // Get gamepad defaults
  // Scan the gamepad inputs and display in the browser
  // Perform corresponding functions for each keypress
  let gamepadObject = navigator.getGamepads()[0];
  let buttons = gamepadObject.buttons;
  let axes = gamepadObject.axes;

  // Read all buttons' inputs
  for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
    // When button is pressed
    // Including the buttons with fractional inputs ranging from 0 to 1
    if (buttons[buttonIndex].value > 0.9) {
      isButtonPressed = true;
      // Keypress function
      keyHandler(buttonIndex);
    }
  }

  // Read all axes' inputs
  for (let axesIndex = 0; axesIndex < axes.length; axesIndex += 2) {
    // When stick moves significantly away from center
    if (
      axes[axesIndex] > 0.8 ||
      axes[axesIndex] < -0.8 ||
      axes[axesIndex + 1] > 0.8 ||
      axes[axesIndex + 1] < -0.8
    ) {
      isButtonPressed = true;
      // When left stick is used
      if (axesIndex === 0 && !isAndroidInput()) {
        const stickFnMap = {
          [axes[axesIndex]]: nextFocus,
          [-axes[axesIndex]]: prevFocus,
          [axes[axesIndex + 1]]: bottomFocus,
          [-axes[axesIndex + 1]]: upFocus,
        };

        const maxIntencity = Object.keys(stickFnMap)
          .map((a) => parseFloat(a))
          .sort((a, b) => b - a)[0];

        focusElement(stickFnMap[maxIntencity]);
      }

      // When right stick is used
      if (axesIndex === 2) {
        // Move to previous option in SELECT dropdown
        if (axes[axesIndex] < 0 || axes[axesIndex + 1] < 0) {
          arrowKeyEventHandler(upKey);
        }

        // Move to next option in SELECT dropdown
        else if (axes[axesIndex] > 0 || axes[axesIndex + 1] > 0) {
          arrowKeyEventHandler(downKey);
        }
      }
    }
  }

  if (isButtonPressed) {
    prevExecutionTime = new Date().getTime();
  }
};

// Event handler for gamepad buttons and axes
// Perform actions/functionality according to inputs recieved
const keyHandler = (buttonIndex) => {
  switch (buttonIndex) {
    // When buttons[0] is pressed
    case 0:
      clickEventHandler();
      break;

    // When buttons[1] is pressed
    case 1:
      hitBack();
      break;

    // When buttons[6] is pressed
    case 6:
      // Move to previous page in history
      window.history.back();
      break;

    // When buttons[7] is pressed
    case 7:
      // Move to next page in history
      window.history.forward();
      break;

    // When buttons[9] is pressed
    case 9:
      // Reload window
      location.reload();
      break;

    // When buttons[12] or buttons[14] is pressed
    case 12:
      focusElement(upFocus);
      break;

    case 14:
      // Move to previous option in SELECT dropdown
      focusElement(prevFocus);
      break;

    // When buttons[13] or buttons[15] is pressed
    case 13:
      focusElement(bottomFocus);
      break;

    case 15:
      // Move to previous option in SELECT dropdown
      focusElement(nextFocus);
      break;
  }
};

// Move the focus to the next or previous element according to action
const focusElement = (action) => {
  // Filter for selecting all focussable elements we want to include
  const focussableElementsFilter =
    'a, button:not([disabled]), input:not([disabled]), select, [tabindex]:not([disabled]):not([tabindex="-1"])';

  const modals = Array.from(document.querySelectorAll("ngb-modal-window"));

  // Select the focussable elements from the webpage and store them
  const focussable = Array.prototype.filter.call(
    (modals.length ? modals[modals.length - 1] : document).querySelectorAll(
      focussableElementsFilter
    ),
    function (element) {
      // Check for visibility while always include the current activeElement
      return (
        element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element === document.activeElement
      );
    }
  );

  // Find index of currently focussed element
  let activeElementIndex = focussable.indexOf(document.activeElement);
  action(activeElementIndex, focussable);

  // Move the focus to first element when the BODY tag is focussed
  if (document.activeElement === document.querySelector("body")) {
    focussable[0].focus();
  }
};

// Parameter passed to focusElement function
// Move the focus to next element
/**
 *
 * @param {number} index
 * @param {Element[]} focussable
 */
const nextFocus = (index, focussable) => {
  // If any element is currently focussed
  if (index > -1) {
    const currentRect = focussable[index].getBoundingClientRect();

    const rowFocussable = focussable
      .filter((element) => {
        const elementRect = element.getBoundingClientRect();
        return (
          currentRect.top < elementRect.bottom &&
          currentRect.bottom > elementRect.top
        );
      })
      .sort(
        (a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x
      );

    const currIndex = rowFocussable.indexOf(focussable[index]);

    let nextElement = rowFocussable[currIndex + 1];

    nextElement?.focus();
  }
};

// Parameter passed to focusElement function
// Move the focus to previous element
const prevFocus = (index, focussable) => {
  // If any element is currently focussed
  if (index > -1) {
    const currentRect = focussable[index].getBoundingClientRect();

    const rowFocussable = focussable
      .filter((element) => {
        const elementRect = element.getBoundingClientRect();
        return (
          currentRect.top < elementRect.bottom &&
          currentRect.bottom > elementRect.top
        );
      })
      .sort(
        (a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x
      );

    const currIndex = rowFocussable.indexOf(focussable[index]);

    let prevElement = rowFocussable[currIndex - 1];

    // Focus on previous element
    prevElement?.focus();
  }
};

const getDistance = (x1, y1, x2, y2) => {
  let y = x2 - x1;
  let x = y2 - y1;

  return Math.sqrt(x * x + y * y);
};

/**
 *
 * @param {number} index
 * @param {Element[]} focussable
 */
const bottomFocus = (index, focussable) => {
  if (index > -1) {
    const currentRect = focussable[index].getBoundingClientRect();
    const bottomEls = focussable
      .filter((element) => {
        const elementRect = element.getBoundingClientRect();
        return (
          currentRect.top < elementRect.top &&
          currentRect.bottom <= elementRect.bottom
        );
      })
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return (
          getDistance(currentRect.x, currentRect.y, aRect.x, aRect.y) -
          getDistance(currentRect.x, currentRect.y, bRect.x, bRect.y)
        );
      });

    bottomEls[0]?.focus();
  }
};

/**
 *
 * @param {number} index
 * @param {Element[]} focussable
 */
const upFocus = (index, focussable) => {
  if (index > -1) {
    const currentRect = focussable[index].getBoundingClientRect();
    const topEls = focussable
      .filter((element) => {
        const elementRect = element.getBoundingClientRect();
        return (
          currentRect.top > elementRect.top &&
          currentRect.bottom >= elementRect.bottom
        );
      })
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return (
          getDistance(currentRect.x, currentRect.y, aRect.x, aRect.y) -
          getDistance(currentRect.x, currentRect.y, bRect.x, bRect.y)
        );
      });

    topEls[0]?.focus();
  }
};

// Click the focussed element
const clickEventHandler = () => {
  // If SELECT element is currently focussed
  // Otherwise perform the regular click option
  if (document.activeElement.nodeName === "SELECT") {
    // Set initial no of options to 0
    let optionsLength = 0;

    // Compute the number of options and store it
    document.activeElement.childNodes.forEach((node) => {
      // Filter out OPTION element only
      if (node.nodeName === "OPTION") {
        optionsLength++;
      }
    });

    // Expand all options in the dropdown
    // Otherwise shrink back dropdown
    if (
      document.activeElement.getAttribute("size") === "1" ||
      !document.activeElement.getAttribute("size")
    ) {
      document.activeElement.setAttribute("size", optionsLength);
    } else {
      document.activeElement.removeAttribute("size");
    }
  } else if (!isAndroidInput()) {
    // Click or Select the currently active element
    document.activeElement.click();
  }
};

const hitBack = () => {
  const lastChild = document.body.lastChild;
  if (isAndroidInput()) {
    document.activeElement.blur();
  } else if (lastChild?.nodeName === "NGB-MODAL-WINDOW") {
    lastChild.dispatchEvent(createEscapeEvent());
  } else if (lastChild?.className?.startsWith("swal")) {
    lastChild?.firstChild?.dispatchEvent(createEscapeEvent());
  } else {
    window.history.back();
  }
};

const createEscapeEvent = () => {
  return new KeyboardEvent("keydown", {
    keyCode: 27,
    which: 27,
    key: "Escape",
    code: "Escape",
  });
};

// Event handler for direction keys on the gamepad
// DIRECTION KEYS - buttons[12], buttons[13], buttons[14], buttons[15]
const arrowKeyEventHandler = (keyFunction) => {
  // If SELECT element is currently focussed
  if (document.activeElement.nodeName === "SELECT") {
    keyFunction(
      Array.from(document.activeElement.childNodes).filter(
        (node) => node.nodeName === "OPTION"
      )
    );
  }
};

// Parameter passed to arrowKeyEventHandler function
// When UP direction key or buttons[12] is pressed
/**
 *
 * @param {HTMLOptionElement[]} options
 */
const upKey = (options) => {
  if (options.length > 1) {
    const selected = options.find((el) => el.selected);

    if (!selected) {
      options[0].selected = true;
    }

    const selectedIndex = options.indexOf(selected);
    selected.selected = false;

    if (selectedIndex === 0) {
      options[options.length - 1].selected = true;
    } else {
      options[selectedIndex - 1].selected = true;
    }
  }
};

// Parameter passed to arrowKeyEventHandler function
// When DOWN direction key or buttons[13] is pressed
/**
 *
 * @param {HTMLOptionElement[]} options
 */
const downKey = (options) => {
  if (options.length > 1) {
    const selected = options.find((el) => el.selected);

    if (!selected) {
      options[0].selected = true;
    }

    const selectedIndex = options.indexOf(selected);
    selected.selected = false;

    if (selectedIndex === options.length - 1) {
      options[0].selected = true;
    } else {
      options[selectedIndex + 1].selected = true;
    }
  }
};

const isAndroidInput = () => {
  return (
    ((document.activeElement.nodeName === "INPUT" &&
      document.activeElement.getAttribute("type") !== "checkbox") ||
      document.activeElement.nodeName === "TEXTAREA") &&
    !!navigator.userAgent.match("Android") &&
    window.screen.height - 50 > window.visualViewport.height
  );
};
