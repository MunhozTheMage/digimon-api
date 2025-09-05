import { Window, Document, Element } from "happy-dom";

export type HtmlElement = Element;

const createVirtualDomFromHtml = (html: string) => {
  const window = new Window();
  window.document.body.innerHTML = html;
  return window.document;
};

const querySelectorAll = (document: Document, selector: string) => {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements);
};

const parseSrcset = (srcset: string) =>
  srcset.split(",").map((s) => s.trim().split(" ")[0]!);

const htmlService = {
  createVirtualDomFromHtml,
  querySelectorAll,
  parseSrcset,
};

export default htmlService;
