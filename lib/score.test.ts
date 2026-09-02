import { describe, it, expect } from 'vitest'
import { fmt, scoreColor, scoreLabel, momentColor, momentLabel, avgScore } from './score'

describe('fmt', () => {
  it('hängt mind. eine Dezimalstelle an', () => {
    expect(fmt(7)).toBe('7.0')
    expect(fmt(10)).toBe('10.0')
    expect(fmt(0)).toBe('0.0')
  })
  it('behält vorhandene Nachkommastellen (max 2)', () => {
    expect(fmt(7.5)).toBe('7.5')
    expect(fmt(7.25)).toBe('7.25')
    expect(fmt(12.3)).toBe('12.3')
  })
  it('rundet/kürzt auf maximal 2 Nachkommastellen', () => {
    expect(fmt(1 / 3)).toBe('0.33')
    expect(fmt(2 / 3)).toBe('0.67')
  })
})

describe('scoreColor', () => {
  it('Overflow-Lila nur für >10', () => {
    expect(scoreColor(10.01)).toContain('purple')
    expect(scoreColor(10)).not.toContain('purple')
  })
  it('Heat-Rot (bold) für Werte unter 0', () => {
    expect(scoreColor(-0.5)).toContain('red-500')
    expect(scoreColor(-0.5)).toContain('font-bold')
    expect(scoreColor(0)).not.toContain('font-bold')
  })
  it('Schwellen grün/amber/rot', () => {
    expect(scoreColor(7)).toContain('green')
    expect(scoreColor(6.99)).toContain('amber')
    expect(scoreColor(4)).toContain('amber')
    expect(scoreColor(3.99)).toContain('red')
  })
})

describe('scoreLabel', () => {
  it('Blitz-Präfix nur über 10', () => {
    expect(scoreLabel(12)).toBe('⚡12.0')
    expect(scoreLabel(9.5)).toBe('9.5')
    expect(scoreLabel(10)).toBe('10.0')
  })
  it('Daumen-Präfix unter 0', () => {
    expect(scoreLabel(-2)).toBe('👎-2.0')
    expect(scoreLabel(0)).toBe('0.0')
  })
})

describe('momentColor / momentLabel', () => {
  it('up → lila mit ⚡, auch bei Score ≤10', () => {
    expect(momentColor('up', 8)).toContain('purple')
    expect(momentLabel('up', 8)).toBe('⚡8.0')
  })
  it('down → rot mit 👎, auch bei positivem Score', () => {
    expect(momentColor('down', 3)).toContain('red-500')
    expect(momentLabel('down', 3)).toBe('👎3.0')
  })
  it('ohne Moment → normale Schwellen/Labels', () => {
    expect(momentColor(null, 7)).toContain('green')
    expect(momentLabel(null, 7)).toBe('7.0')
  })
})

describe('avgScore', () => {
  it('null bei leerer Liste', () => {
    expect(avgScore([])).toBeNull()
  })
  it('arithmetisches Mittel', () => {
    expect(avgScore([5, 7])).toBe(6)
    expect(avgScore([10, 0, 5])).toBe(5)
  })
  it('ignoriert NaN-Werte', () => {
    expect(avgScore([6, NaN, 8])).toBe(7)
  })
})
