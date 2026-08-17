// Quote content is stored as a small allowed subset of HTML (bold/italic/
// highlight, produced by the RichTextInput editor) rather than plain text.
// Anything parsed here is walked and rebuilt through this allowlist before
// it's ever written back out or rendered with v-html, so no foreign markup
// or attributes survive the round trip.
function sanitizeChildren(source: Node, target: Node) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(node.textContent || ''))
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName

    if (tag === 'BR') {
      target.appendChild(document.createElement('br'))
      return
    }

    // Contenteditable browsers represent a new line as a wrapping block
    // (<div>/<p>) rather than a <br>. Flatten those into a line break instead
    // of preserving block structure, so the stored markup stays inline.
    if (tag === 'DIV' || tag === 'P') {
      if (target.lastChild) target.appendChild(document.createElement('br'))
      sanitizeChildren(el, target)
      return
    }

    if (tag === 'B' || tag === 'STRONG') {
      const wrap = document.createElement('strong')
      sanitizeChildren(el, wrap)
      target.appendChild(wrap)
      return
    }

    if (tag === 'I' || tag === 'EM') {
      const wrap = document.createElement('em')
      sanitizeChildren(el, wrap)
      target.appendChild(wrap)
      return
    }

    if (tag === 'MARK') {
      const wrap = document.createElement('mark')
      wrap.className = 'quote-highlight'
      sanitizeChildren(el, wrap)
      target.appendChild(wrap)
      return
    }

    // Unknown tag: drop it but keep its text content inline.
    sanitizeChildren(el, target)
  })
}

export function sanitizeQuoteHtml(html: string): string {
  if (!html) return ''
  const template = document.createElement('template')
  template.innerHTML = html
  const container = document.createElement('div')
  sanitizeChildren(template.content, container)
  return container.innerHTML
}

export function stripHtml(html: string): string {
  if (!html) return ''
  const container = document.createElement('div')
  container.innerHTML = sanitizeQuoteHtml(html)
  container.querySelectorAll('br').forEach(br => br.replaceWith('\n'))
  return container.textContent || ''
}
