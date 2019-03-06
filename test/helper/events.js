var triggerEvent = function (eventType, selector, opts = {}) {
  let element = (typeof selector === 'string') ? document.querySelector(selector) : selector;

  return new Promise(resolve => {
    if (opts.position) {

      const { x,y } = (typeof selector === 'string') ? element.getBoundingClientRect() : { x: 0, y: 0 };

      if (eventType.indexOf('drag') !== -1) {
        element.dispatchEvent(new DragEvent(eventType, {
          bubbles: true,
          cancelable: true,
          clientX: x + opts.position.x,
          clientY: y + opts.position.y
        }));
      } else {
        element.dispatchEvent(new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          clientX: x + opts.position.x,
          clientY: y + opts.position.y
        }));
      }
    } else {
      element.dispatchEvent(new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true
      }));
    }

    setTimeout(resolve, 10);
  });
};

var triggerEventSync = function (eventType, selector, opts = {}) {
  let element = document.querySelector(selector);

  if (opts.position) {
    const { x,y } = element.getBoundingClientRect();

    element.dispatchEvent(new MouseEvent(eventType, {
      bubbles: true,
      cancelable: true,
      clientX: x + opts.position.x,
      clientY: y + opts.position.y
    }));
  } else {
    element.dispatchEvent(new Event(eventType, {
      bubbles: true,
      cancelable: true
    }));
  }
};

var waitFor = async function (timeout) {
  const promise = new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

  return await promise;
};

(function (window) {
  try {
    new MouseEvent('test');
    return false; // No need to polyfill
  } catch (e) {
    // Need to polyfill - fall through
  }

  // Polyfills DOM4 MouseEvent
  var MouseEventPolyfill = function (eventType, params) {
    params = params || { bubbles: false, cancelable: false };
    var mouseEvent = document.createEvent('MouseEvent');
    mouseEvent.initMouseEvent(eventType,
      params.bubbles,
      params.cancelable,
      window,
      0,
      params.screenX || 0,
      params.screenY || 0,
      params.clientX || 0,
      params.clientY || 0,
      params.ctrlKey || false,
      params.altKey || false,
      params.shiftKey || false,
      params.metaKey || false,
      params.button || 0,
      params.relatedTarget || null
    );

    return mouseEvent;
  }

  MouseEventPolyfill.prototype = Event.prototype;

  window.MouseEvent = MouseEventPolyfill;
})(window);
