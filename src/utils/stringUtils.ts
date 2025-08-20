export const pad = (
  str: string | number | undefined,
  l: number,
  fs = " " /* "\u2800" */,
  padStart = false
) => {
  if (str === undefined) str = "---";
  str = "" + str;
  str = ("" + str).slice(0, l);
  return padStart ? str.padStart(l, fs) : str.padEnd(l, fs);
};
