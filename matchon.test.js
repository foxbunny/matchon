import {match, on} from './matchon'

test('return a function that will match on type', () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const f = match(
    on('Null', fn1),
    on('String', fn2),
  )
  f(null)
  expect(fn1).toHaveBeenCalledWith(null)
  expect(fn2).not.toHaveBeenCalled()
})

test('will match on second type', () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const f = match(
    on('Null', fn1),
    on('String', fn2),
  )
  f('foo')
  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalledWith('foo')
})

test('will return values syncrhonously', () => {
  const fn1 = jest.fn(x => 'matched ' + x)
  const fn2 = jest.fn(x => 'matched ' + x)
  const f = match(
    on('Null', fn1),
    on('String', fn2),
  )
  const ret = f('foo')
  expect(ret).toBe('matched foo')
})

test('can match on multiple arguments', () => {
  const f = match(
    on('Number, Number', (x, y) => x + y),
    on('String, Number', (x, y) => parseInt(x, 10) + y),
    on('Number', x => x + 1),
  )
  expect(f('12', 4)).toBe(16)
  expect(f(12, 6)).toBe(18)
  expect(f(4)).toBe(5)
})

test('if no patterns match, exception is thrown', () => {
  const f = match(
    on('String', x => x),
    on('Boolean', x => !x),
  )
  expect(() => f(12)).toThrow('No pattern matched <Number>')
})

test('can use catch-all pattern', () => {
  const f = match(
    on('String', () => 'string'),
    on('Number', () => 'number'),
    on(() => 'everything else'),
  )
  expect(f('foo')).toBe('string')
  expect(f(12)).toBe('number')
  expect(f(null)).toBe('everything else')
  expect(f(false)).toBe('everything else')
})

test('can use one of the built-in ctors', () => {
  const f = match(
    on('Date', d => d.toISOString().split('T')[0]),
    on('String', x => x),
  )
  const d = new Date(1451343600000)
  expect(f(d)).toBe('2015-12-28')
  expect(f('2015-12-28')).toBe('2015-12-28')
})

test('can use a custom ctor', () => {
  function MyCtor() {
    this.x = 12
  }
  const f = match(
    on('MyCtor', x => x.x),
    on('Number', x => x)
  )
  expect(f(new MyCtor)).toBe(12)
  expect(f(4)).toBe(4)
})

test('can match arguments of Any type', () => {
  const f = match(
    on('String, *', (x, y) => ['string', x, y]),
    on('Number, *', (x, y) => ['number', x, y]),
  )
  expect(f('foo', true)).toEqual(['string', 'foo', true])
  expect(f('foo', null)).toEqual(['string', 'foo', null])
  expect(f('foo', 15)).toEqual(['string', 'foo', 15])
  expect(f(12, 'bar')).toEqual(['number', 12, 'bar'])
  expect(f(12, true)).toEqual(['number', 12, true])
  expect(f(12, null)).toEqual(['number', 12, null])
})

test('star is not the same as optional', () => {
  const f = match(
    on('String, *', () => {})
  )
  expect(() => f('foo')).toThrow('No pattern matched <String>')
})

test('benchmark', () => {
  // The goal of this benchmark is to track relative performance
  // between refactorings, not set speed records or compare 
  // against other libraries/techniques.

  const loops = 10000
  const f = match(
    on('String, Number, Boolean', (s, n, b) => 
      parseInt(s, 10) + n + (b ? 1 : 0)),
    on('Number, String, Boolean', (n, s, b) =>
      parseInt(s, 10) + n + (b ? 1 : 0)),
    on('Boolean, String, Number', (b, s, n) =>
      parseInt(s, 10) + n + (b ? 1 : 0))
  )
  let r = 0
  let times = []
  for (let i = loops; i--;) {
    const start = (new Date).getTime()
    r += f('12', i, true)
    r += f(i, '2', false)
    r += f(true, '5', i)
    times.push((new Date).getTime() - start)
  }
  const total = times.reduce((x, y) => x + y)
  const average = total / times.length
  console.log(`*** Benchmark results: ${total}ms (avg: ${average.toFixed(3)}ms) ***`)

  // 1500ms is an arbitrary failure condition that we set to catch issues that
  // makes the code *dramatically* slower. It's not to be taken as how slow 
  // or fast we think the code *should* go. Average time on a Core i7 laptop
  // running latest NodeJS releases is about 300~600ms per run.
  //
  // In general, we are interested in *relative* performance when tweaking the 
  // code, not in absolute performance.
  expect(total <= 1500).toBe(true) 
})