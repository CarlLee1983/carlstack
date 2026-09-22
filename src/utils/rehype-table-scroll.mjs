const WRAPPER_CLASS = "table-scroll";

/**
 * 把表格包進容器，並為 td 注入對應的 th data-label，
 * 支援行動端轉換為卡片式佈局，並在寬表時支援水平捲動。
 * role="region" + tabindex 讓鍵盤使用者也能捲動。
 */
export default function rehypeTableScroll() {
  /** @param {HastNode} tree */
  return (tree) => {
    wrapTables(tree);
  };
}

/**
 * @typedef {{ type: string, tagName?: string, properties?: Record<string, unknown>, children?: HastNode[], value?: string }} HastNode
 */

/**
 * @param {HastNode} node
 * @returns {string}
 */
function extractText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (Array.isArray(node.children)) {
    return node.children.map((child) => extractText(child)).join("");
  }
  return "";
}

/**
 * 從 table 尋找 thead 或第一個 tr 的 th 標題清單
 * @param {HastNode} tableNode
 * @returns {string[]}
 */
function getHeaderLabels(tableNode) {
  /** @type {string[]} */
  const headers = [];
  if (!tableNode || !Array.isArray(tableNode.children)) return headers;

  /** @param {HastNode} node */
  function findThs(node) {
    if (!node) return;
    if (node.type === "element" && node.tagName === "th") {
      headers.push(extractText(node).trim());
    } else if (Array.isArray(node.children)) {
      for (const child of node.children) {
        findThs(child);
      }
    }
  }

  // 優先尋找 thead
  const thead = tableNode.children.find(
    (c) => c?.type === "element" && c.tagName === "thead",
  );
  if (thead) {
    findThs(thead);
  } else {
    // 若無 thead，檢查第一行 tr 中的 th
    const firstTr = tableNode.children.find(
      (c) => c?.type === "element" && c.tagName === "tr",
    );
    if (firstTr) {
      findThs(firstTr);
    }
  }

  return headers;
}

/**
 * 遍歷 tbody / tr，將對應欄位標籤注入 td 的 data-label
 * @param {HastNode} tableNode
 * @param {string[]} headers
 */
function annotateCellsWithLabels(tableNode, headers) {
  if (
    !tableNode ||
    headers.length === 0 ||
    !Array.isArray(tableNode.children)
  ) {
    return;
  }

  /** @param {HastNode} row */
  function processRow(row) {
    if (
      row?.type !== "element" ||
      row.tagName !== "tr" ||
      !Array.isArray(row.children)
    ) {
      return;
    }
    let colIndex = 0;
    for (const cell of row.children) {
      if (cell?.type === "element" && cell.tagName === "td") {
        if (!cell.properties) {
          cell.properties = {};
        }
        if (headers[colIndex] !== undefined) {
          cell.properties["data-label"] = headers[colIndex];
        }
        colIndex++;
      }
    }
  }

  for (const child of tableNode.children) {
    if (child?.type === "element") {
      if (child.tagName === "tbody") {
        if (Array.isArray(child.children)) {
          child.children.forEach(processRow);
        }
      } else if (child.tagName === "tr") {
        processRow(child);
      }
    }
  }
}

/** @param {HastNode} node */
function wrapTables(node) {
  if (!node || typeof node !== "object" || !Array.isArray(node.children)) {
    return;
  }
  node.children = node.children.map((child) => {
    wrapTables(child);
    if (child?.type !== "element" || child.tagName !== "table") return child;
    if (isWrapper(node)) return child;

    const headers = getHeaderLabels(child);
    annotateCellsWithLabels(child, headers);

    return {
      type: "element",
      tagName: "div",
      properties: {
        className: WRAPPER_CLASS,
        role: "region",
        tabIndex: 0,
        "aria-label": "表格，可水平捲動",
      },
      children: [child],
    };
  });
}

/** @param {HastNode} node */
function isWrapper(node) {
  return (
    node.type === "element" && node.properties?.className === WRAPPER_CLASS
  );
}
