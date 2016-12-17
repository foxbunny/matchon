const whatis = x =>
  x && x.constructor ?
    x.constructor.name :
    Object.prototype.toString.call(x)
      .replace('[object ', '')
      .replace(']', '')

const mismatch = (...xs) => {
  throw new Error('No pattern matched <' + pattern(xs) + '>')
}

const first = ([fn, ...rest], p) => {
  if (!fn) return mismatch
  const f = fn(p)
  if (f) return f
  return first(rest, p)
}

const isSameType = (x, y) =>
  x === '*' || y === '*' || x === y

const hasMatch = (xs, ys) =>
  xs.length === ys.length && 
  xs.reduce(
    (acc, x, i) => acc && isSameType(x, ys[i]), 
    true)

const trim = s => s.trim()

const normalized = p =>
  p.split(',').map(trim)

const pattern = xs =>
  xs.map(whatis)

const _on = (p, fn) => {
  const norm = normalized(p)
  return p2 => hasMatch(norm, p2) ? fn : undefined
}

export const match = (...fns) => (...xs) =>
  first(fns, pattern(xs))(...xs)

export const on = match(
  _on('String, Function', _on),
  _on('Function', fn => () => fn),
)

export default { match, on }