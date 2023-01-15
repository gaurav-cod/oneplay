export function debounce_leading(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}
