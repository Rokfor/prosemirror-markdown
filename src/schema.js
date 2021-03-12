import {Schema} from "prosemirror-model"

// ::Schema Document schema for the data model used by CommonMark.
export const schema = new Schema({
  nodes: {
    doc: {
      content: "block+"
    },

    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{tag: "p"}],
      toDOM() { return ["p", 0] }
    },

    blockquote: {
      content: "block+",
      group: "block",
      parseDOM: [{tag: "blockquote"}],
      toDOM() { return ["blockquote", 0] }
    },

    horizontal_rule: {
      group: "block",
      parseDOM: [{tag: "hr"}],
      toDOM() { return ["div", ["hr"]] }
    },

    heading: {
      attrs: {level: {default: 1}},
      content: "(text | image)*",
      group: "block",
      defining: true,
      parseDOM: [{tag: "h1", attrs: {level: 1}},
                 {tag: "h2", attrs: {level: 2}},
                 {tag: "h3", attrs: {level: 3}},
                 {tag: "h4", attrs: {level: 4}},
                 {tag: "h5", attrs: {level: 5}},
                 {tag: "h6", attrs: {level: 6}}],
      toDOM(node) { return ["h" + node.attrs.level, 0] }
    },

    code_block: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      marks: "",
      attrs: {params: {default: ""}},
      parseDOM: [{tag: "pre", preserveWhitespace: "full", getAttrs: node => (
        {params: node.getAttribute("data-params") || ""}
      )}],
      toDOM(node) { return ["pre", node.attrs.params ? {"data-params": node.attrs.params} : {}, ["code", 0]] }
    },

    ordered_list: {
      content: "list_item+",
      group: "block",
      attrs: {order: {default: 1}, tight: {default: false}},
      parseDOM: [{tag: "ol", getAttrs(dom) {
        return {order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
                tight: dom.hasAttribute("data-tight")}
      }}],
      toDOM(node) {
        return ["ol", {start: node.attrs.order == 1 ? null : node.attrs.order,
                       "data-tight": node.attrs.tight ? "true" : null}, 0]
      }
    },

    bullet_list: {
      content: "list_item+",
      group: "block",
      attrs: {tight: {default: false}},
      parseDOM: [{tag: "ul", getAttrs: dom => ({tight: dom.hasAttribute("data-tight")})}],
      toDOM(node) { return ["ul", {"data-tight": node.attrs.tight ? "true" : null}, 0] }
    },

    list_item: {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{tag: "li"}],
      toDOM() { return ["li", 0] }
    },


    description_list: {
      content: "(description_term description_value)+",
      defining: true,
      group: "block",
      parseDOM: [{tag: "dl"}],
      toDOM() { return ["dl", 0] }
    },

    description_term: {
      content: "inline*",
      defining: true,
      parseDOM: [{tag: "dt"}],
      toDOM() { return ["dt", 0] }
    },

    description_value: {
      content: "inline*",
      defining: true,
      parseDOM: [{tag: "dd"}],
      toDOM() {return ["dd", 0] }
    },

    text: {
      group: "inline"
    },

    image: {
      inline: true,
      attrs: {
        src: {},
        alt: {default: null},
        title: {default: null}
      },
      group: "inline",
      draggable: true,
      parseDOM: [{tag: "img[src]", getAttrs(dom) {
        return {
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt")
        }
      }}],
      toDOM(node) { return ["img", node.attrs] }
    },

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br"}],
      toDOM() { return ["br"] }
    },

    footnote: {
      content: "paragraph+",
      group: "block",
      draggable: true,     
      parseDOM: [{tag: "footnote"}],
      toDOM() { return ["footnote", 0] }
      /*content: "inline*",
      group: "inline",
      inline: true,
      atom: true,
      toDOM: () => ["footnote", 0],
      parseDOM: [{tag: "footnote"}]*/
    },
    

    comment: {
      content: "paragraph+",
      group: "block",
      draggable: true,
      parseDOM: [{tag: "comment"}],
      toDOM() { return ["comment", 0] }
    },

    latex: {
      content: "paragraph+",
      group: "block",
	    draggable: true,      
      code: true,
      parseDOM: [{tag: "latex"}],
      toDOM() { return ["latex", 0] }
    },

    paragraphalternate: {
      content: "block+",
      group: "block",
      draggable: true,
      parseDOM: [{tag: "paragraphalternate"}],
      toDOM() { return ["paragraphalternate", 0] }
    },

    language: {
      content: "block+",
      group: "block",
      attrs: {
        language: {},
      },
      atom: true,
      isLeaf: true,
      parseDOM: [{tag: "language", getAttrs(dom) {
        return {language: dom.getAttribute("language")}
      }}],
      toDOM(node) { return ["language", {"language": node.attrs.language}, 0] },
    }
  },

  marks: {
    em: {
      parseDOM: [{tag: "i"}, {tag: "em"},
                 {style: "font-style", getAttrs: value => value == "italic" && null}],
      toDOM() { return ["em"] },
      group: "textformatting"
    },

    strong: {
      parseDOM: [{tag: "b"}, {tag: "strong"},
                 {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
      toDOM() { return ["strong"] },
      group: "textformatting"
    },

    link: {
      attrs: {
        href: {},
        title: {default: null}
      },
      inclusive: false,
      parseDOM: [{tag: "a[href]", getAttrs(dom) {
        return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
      }}],
      toDOM(node) { return ["a", node.attrs] }
    },

    code: {
      parseDOM: [{tag: "code"}],
      toDOM() { return ["code"] },
      group: "textformatting"
    },

    index: {
      parseDOM: [{tag: "index"}],
      toDOM() { return ["index"] },
      group: "writer",
      excludes: "_",
      inclusive: false
    },
    
    mark: {
      parseDOM: [{tag: "mark"}],
      toDOM() { return ["mark"] },
      group: "writer",
      excludes: "_",
      inclusive: false
    },
    
    reference: {
      parseDOM: [{tag: "reference"}],
      toDOM() { return ["reference"] },
      group: "writer",
      excludes: "_",
      inclusive: false
    }, 
    
    fn: {
      parseDOM: [{tag: "fn"}],
      toDOM() { return ["fn"] },
      group: "writer",
      excludes: "_",
      inclusive: false
    },

    bibliography: {
      attrs: {
        reference: {},
        pre: {},
        post: {}
      },
      inclusive: false,
      parseDOM: [{tag: "bibliography", getAttrs(dom) {
        return {
          reference: dom.getAttribute("reference"),
          pre: dom.getAttribute("pre"),
          post: dom.getAttribute("post")
        }
      }}],
      toDOM(node) { return ["bibliography", {"reference": node.attrs.reference, "pre": node.attrs.pre, "post": node.attrs.post}, 0] }
    }
  }
})
