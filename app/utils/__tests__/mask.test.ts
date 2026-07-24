import { describe, it, expect } from 'vitest'
import {
  maskName,
  maskEmail,
  maskPhone,
  maskStreet,
  maskRecipient,
  maskNickname,
} from '../mask'

describe('maskName', () => {
  describe('basic cases', () => {
    it('masks two-word name keeping first name and first letter of surname', () => {
      expect(maskName('Иван Иванов')).toBe('Иван И.')
    })

    it('masks single word', () => {
      expect(maskName('Иван')).toBe('И***')
    })

    it('uses only the second part when more than two words', () => {
      expect(maskName('Иван Петров Сидоров')).toBe('Иван П.')
    })
  })

  describe('edge cases', () => {
    it('trims extra whitespace', () => {
      expect(maskName('  Иван  Иванов  ')).toBe('Иван И.')
    })

    it('preserves case of single word', () => {
      expect(maskName('иван')).toBe('и***')
    })

    it('preserves case of two-word name', () => {
      expect(maskName('ИВАН ИВАНОВ')).toBe('ИВАН И.')
    })

    it('collapses internal newlines and tabs', () => {
      expect(maskName('Иван\n\tИванов')).toBe('Иван И.')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskName('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskName(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskName(undefined)).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(maskName('   ')).toBe('')
    })
  })
})

describe('maskEmail', () => {
  describe('basic cases', () => {
    it('masks gmail address keeping suffix', () => {
      expect(maskEmail('ivan@gmail.com')).toBe('i***@***.com')
    })

    it('masks multi-level domain keeping last suffix', () => {
      expect(maskEmail('test@example.co.uk')).toBe('t***@***.uk')
    })

    it('masks short local part', () => {
      expect(maskEmail('a@b.com')).toBe('a***@***.com')
    })
  })

  describe('edge cases', () => {
    it('keeps suffix even when last domain part is 1 char', () => {
      expect(maskEmail('a@b.c')).toBe('a***@***.c')
    })

    it('drops suffix when domain has no dot', () => {
      expect(maskEmail('ab@cd')).toBe('a***@***')
    })

    it('returns empty string when @ is missing', () => {
      expect(maskEmail('invalid-no-at')).toBe('')
    })

    it('returns empty string when local part is empty', () => {
      expect(maskEmail('@gmail.com')).toBe('')
    })

    it('returns empty string when domain is empty', () => {
      expect(maskEmail('ivan@')).toBe('')
    })

    it('trims surrounding whitespace before masking', () => {
      expect(maskEmail('  ivan@gmail.com  ')).toBe('i***@***.com')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskEmail('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskEmail(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskEmail(undefined)).toBe('')
    })
  })
})

describe('maskPhone', () => {
  describe('basic cases', () => {
    it('masks formatted phone keeping country code first digit and last two digits', () => {
      expect(maskPhone('+7 999 123-45-11')).toBe('+7 *** ***-**-11')
    })

    it('masks unformatted phone keeping country code first digit and last two digits', () => {
      expect(maskPhone('+79991234567')).toBe('+7********67')
    })

    it('preserves separators and keeps country code first digit', () => {
      expect(maskPhone('+7 (999) 123-45-11')).toBe('+7 (***) ***-**-11')
    })
  })

  describe('edge cases', () => {
    it('masks all digits when total length is less than 4', () => {
      expect(maskPhone('123')).toBe('***')
    })

    it('masks all digits when only one digit present', () => {
      expect(maskPhone('+1')).toBe('+*')
    })

    it('masks all digits when two digits present', () => {
      expect(maskPhone('+12')).toBe('+**')
    })

    it('masks all digits when three digits present', () => {
      expect(maskPhone('+123')).toBe('+***')
    })

    it('keeps first digit and last two digits when length equals 4', () => {
      expect(maskPhone('+1234')).toBe('+1*34')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskPhone('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskPhone(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskPhone(undefined)).toBe('')
    })
  })
})

describe('maskStreet', () => {
  describe('basic cases', () => {
    it('keeps first letter and masks the rest', () => {
      expect(maskStreet('Ленина')).toBe('Л***')
    })

    it('works for single letter', () => {
      expect(maskStreet('A')).toBe('A***')
    })
  })

  describe('edge cases', () => {
    it('trims surrounding whitespace', () => {
      expect(maskStreet('  Невский  ')).toBe('Н***')
    })

    it('preserves case', () => {
      expect(maskStreet('LENINA')).toBe('L***')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskStreet('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskStreet(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskStreet(undefined)).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(maskStreet('   ')).toBe('')
    })
  })
})

describe('maskRecipient', () => {
  describe('basic cases', () => {
    it('masks each part of full name', () => {
      expect(maskRecipient('Иванов Иван Иванович')).toBe('И*** И*** И***')
    })

    it('masks two parts', () => {
      expect(maskRecipient('Иванов Иван')).toBe('И*** И***')
    })

    it('masks single part', () => {
      expect(maskRecipient('Иван')).toBe('И***')
    })
  })

  describe('edge cases', () => {
    it('collapses multiple spaces between parts', () => {
      expect(maskRecipient('Иванов   Иван   Иванович')).toBe('И*** И*** И***')
    })

    it('trims leading and trailing whitespace', () => {
      expect(maskRecipient('  Иванов Иван  ')).toBe('И*** И***')
    })

    it('preserves case for each part', () => {
      expect(maskRecipient('PETROV IVAN')).toBe('P*** I***')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskRecipient('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskRecipient(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskRecipient(undefined)).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(maskRecipient('   ')).toBe('')
    })
  })
})

describe('maskNickname', () => {
  describe('basic cases', () => {
    it('adds @ and masks after first letter', () => {
      expect(maskNickname('ivan')).toBe('@i***')
    })

    it('strips existing @ before masking', () => {
      expect(maskNickname('@ivan')).toBe('@i***')
    })

    it('preserves case', () => {
      expect(maskNickname('Ivan')).toBe('@I***')
    })
  })

  describe('edge cases', () => {
    it('trims surrounding whitespace', () => {
      expect(maskNickname('  test  ')).toBe('@t***')
    })

    it('strips @ after trimming', () => {
      expect(maskNickname('  @test  ')).toBe('@t***')
    })

    it('handles single letter nickname', () => {
      expect(maskNickname('a')).toBe('@a***')
    })

    it('handles nickname that is only @', () => {
      expect(maskNickname('@')).toBe('')
    })
  })

  describe('null and undefined', () => {
    it('returns empty string for empty input', () => {
      expect(maskNickname('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(maskNickname(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(maskNickname(undefined)).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(maskNickname('   ')).toBe('')
    })
  })
})
