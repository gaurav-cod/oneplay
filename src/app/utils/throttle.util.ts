export function throttle(func: Function, timeout = 300) {
  let last = 0
  return (...args: any[]) => {
    const now = +new Date()
    if (now - last < timeout) return
    else last = now
    return func.apply(this, args)
  }
}

export function throttle_to_latest(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;
  let value: any[] = [];
  return (...args: any[]) => {
    value = args;
    if (timer) return;
    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = undefined;
      func.apply(this, value)
    }, timeout)
  }
}
