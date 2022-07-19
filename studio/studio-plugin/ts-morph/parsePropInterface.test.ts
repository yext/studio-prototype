import parsePropInterface from './parsePropInterface'

jest.spyOn(console, 'error').mockImplementation(jest.fn())

it('updates correctly', () => {
  const propShape = parsePropInterface('studio/studio-plugin/__fixtures__/components/Banner.tsx', 'BannerProps')
  expect(propShape).toEqual({
    title: {
      type: 'string'
    },
    randomNum: {
      type: 'number',
      doc: 'jsdoc single line'
    },
    someBool: {
      type: 'boolean',
      doc: '\nthis is a jsdoc\nmulti-line comments!'
    },
    backgroundColor: {
      type: 'HexColor'
    }
  })
  expect(console.error).toBeCalledWith('Prop type ColorProp is not recognized. Skipping gracefully.')
})
