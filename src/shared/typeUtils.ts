/* Types coming from OpenAPI spec include an [k: string]: any key, which makes type narrowing harder */
export type RemoveIndexSignature<T> = {
  [Property in keyof T as string extends Property ? never : number extends Property ? never : Property]: T[Property];
};
