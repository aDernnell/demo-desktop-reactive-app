import { Readable, HtmlLiterals } from "@adernnell/simplereactivedom";

export type RenderableContent = Readable<Node | HtmlLiterals> | Node | HtmlLiterals;

/**
 * Utility type to make all properties of T required except for those in K
 */
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Partial<Pick<T, K>>