declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.json' {
  const value: any;
  export default value;
}
