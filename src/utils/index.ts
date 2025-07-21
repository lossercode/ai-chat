/* eslint-disable @typescript-eslint/no-explicit-any */
// 帮我写一个防抖的函数
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const debounce = (fn: Function, delay: number) => {
    let timer: number | null = null;
    return (...args: any[]) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}   

export function isValidJSON(str: string) {
    try {
      JSON.parse(str);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  }