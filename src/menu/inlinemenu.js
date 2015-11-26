import {defineOption} from "../edit"
import {spanStylesAt} from "../model"
import {elt, insertCSS} from "../dom"
import {MenuUpdate} from "./update"

import {Tooltip} from "./tooltip"
import {Menu, TooltipDisplay, commandGroups, forceFontLoad} from "./menu"

const classPrefix = "ProseMirror-inlinemenu"

defineOption("inlineMenu", false, function(pm, value) {
  if (pm.mod.inlineMenu) pm.mod.inlineMenu.detach()
  pm.mod.inlineMenu = value ? new InlineMenu(pm, value) : null
})

class InlineMenu {
  constructor(pm, config) {
    this.pm = pm
    this.items = (config && config.items) || commandGroups(pm, "inline")
    this.nodeItems = (config && config.nodeItems) || commandGroups(pm, "block")
    this.showLinks = config ? config.showLinks !== false : true
    this.update = new MenuUpdate(pm, "change selectionChange blur", () => this.prepareUpdate())

    this.tooltip = new Tooltip(pm, "above")
    this.menu = new Menu(pm, new TooltipDisplay(this.tooltip, () => this.update.force()))

    forceFontLoad(pm)
  }

  detach() {
    this.update.detach()
    this.tooltip.detach()
  }

  prepareUpdate() {
    if (this.menu.active) return null

    let {empty, node, head} = this.pm.selection, link
    if (!this.pm.hasFocus()) {
      return () => this.tooltip.close()
    } else if (node && node.isBlock) {
      let coords = topOfNodeSelection(this.pm)
      return () => this.menu.show(this.nodeItems, coords)
    } else if (!empty) {
      let coords = node ? topOfNodeSelection(this.pm) : topCenterOfSelection()
      return () => this.menu.show(this.items, coords)
    } else if (this.showLinks && (link = this.linkUnderCursor())) {
      let coords = this.pm.coordsAtPos(head)
      return () => this.showLink(link, coords)
    } else {
      return () => this.tooltip.close()
    }
  }

  linkUnderCursor() {
    let head = this.pm.selection.head
    if (!head) return null
    let styles = spanStylesAt(this.pm.doc, head)
    return styles.reduce((found, st) => found || (st.type.name == "link" && st), null)
  }

  showLink(link, pos) {
    let node = elt("div", {class: classPrefix + "-linktext"}, elt("a", {href: link.attrs.href, title: link.attrs.title}, link.attrs.href))
    this.tooltip.open(node, pos)
  }
}

/**
 * Get the x and y coordinates at the top center of the current DOM selection.
 *
 * @return {Object}
 */
function topCenterOfSelection() {
  let rects = window.getSelection().getRangeAt(0).getClientRects()
  let {left, right, top} = rects[0], i = 1
  while (left == right && rects.length > i) {
    ;({left, right, top} = rects[i++])
  }
  for (; i < rects.length; i++) {
    if (rects[i].top < rects[0].bottom - 1 &&
        // Chrome bug where bogus rectangles are inserted at span boundaries
        (i == rects.length - 1 || Math.abs(rects[i + 1].left - rects[i].left) > 1)) {
      left = Math.min(left, rects[i].left)
      right = Math.max(right, rects[i].right)
      top = Math.min(top, rects[i].top)
    }
  }
  return {top, left: (left + right) / 2}
}

function topOfNodeSelection(pm) {
  let selected = pm.content.querySelector(".ProseMirror-selectednode")
  if (!selected) return {left: 0, top: 0}
  let box = selected.getBoundingClientRect()
  return {left: Math.min((box.left + box.right) / 2, box.left + 20), top: box.top}
}

insertCSS(`

.ProseMirror-inlinemenu-linktext a {
  color: white;
  text-decoration: none;
  padding: 0 5px;
}

.ProseMirror-inlinemenu-linktext a:hover {
  text-decoration: underline;
}

`)
