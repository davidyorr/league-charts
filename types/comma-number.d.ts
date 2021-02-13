declare module "comma-number" {
  function commaNumber(
    number: string | number,
    separator?: string,
    decimalChar?: string
  );

  export = commaNumber;
}
