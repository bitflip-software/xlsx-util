const xlsx = require('../index')
const path = require('path')

describe('readFile', () => {
    it('should return data', async (done) => {
        expect.assertions(14)

        const filepath = path.join(__dirname, 'small.xlsx')
        const result = await xlsx.readFile(filepath)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(4)

        expect(result[0].A).toBe('Hello')
        expect(result[0].B).toBe('World')

        expect(result[1].A).toBe(1)
        expect(result[1].B).toBe(2)
        expect(result[1].C).toBe(4)

        expect(result[2].A).toBe(5.5)
        expect(result[2].B).toBe(6)
        expect(result[2].C).toBeNull()

        expect(result[3].A).toBe('pp')
        expect(result[3].B).toBe('or')
        expect(result[3].C).toBeCloseTo(0.07792207792207792, 10)

        done();
    })
})


describe('readFile', () => {
    it('should throw on bad filename', async (done) => {
        expect.assertions(1)

        const filepath = path.join(__dirname, 'badfilename')
        let error = null
        await xlsx.readFile(filepath).then().catch((err)=>{error=err})
        expect(error).toBeTruthy()
        done();
    })
})


describe('readFileWithHeaders', () => {
    it('should return data', async (done) => {
        expect.assertions(12)

        const filepath = path.join(__dirname, 'small.xlsx')
        const result = await xlsx.readFileWithHeaders(filepath)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(3)

        let r = 0
        expect(result[r].Hello).toBe(1)
        expect(result[r].World).toBe(2)
        expect(result[r].C).toBe(4)

        r = 1
        expect(result[r].Hello).toBe(5.5)
        expect(result[r].World).toBe(6)
        expect(result[r].C).toBeNull()

        r = 2
        expect(result[r].Hello).toBe('pp')
        expect(result[r].World).toBe('or')
        expect(result[r].C).toBeCloseTo(0.07792207792207792, 10)

        done();
    })
})


describe('readFileWithHeaderTransform', () => {
    it('should return data', async (done) => {
        expect.assertions(12)

        const filepath = path.join(__dirname, 'small.xlsx')

        const transform = {
            Hello: 'Bones',
            World: 'Bish',
            C: 'Fish'
        }

        const result = await xlsx.readFileWithHeaderTransform(filepath, transform)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(3)

        let r = 0
        expect(result[r].Bones).toBe(1)
        expect(result[r].Bish).toBe(2)
        expect(result[r].Fish).toBe(4)

        r = 1
        expect(result[r].Bones).toBe(5.5)
        expect(result[r].Bish).toBe(6)
        expect(result[r].Fish).toBeNull()

        r = 2
        expect(result[r].Bones).toBe('pp')
        expect(result[r].Bish).toBe('or')
        expect(result[r].Fish).toBeCloseTo(0.07792207792207792, 10)

        done();
    })
})


describe('readFileWithHeaderTransformAndDelete', () => {
    it('should return data', async (done) => {
        expect.assertions(12)

        const filepath = path.join(__dirname, 'small.xlsx')

        const transform = {
            Hello: 'Bones',
            World: 'Bish',
            C: 'Fish'
        }

        const deletes = ['World']

        const result = await xlsx.readFileWithHeaderTransformAndDelete(filepath, transform, deletes)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(3)

        let r = 0
        expect(result[r].Bones).toBe(1)
        expect(result[r].Bish).toBeUndefined()
        expect(result[r].Fish).toBe(4)

        r = 1
        expect(result[r].Bones).toBe(5.5)
        expect(result[r].Bish).toBeUndefined()
        expect(result[r].Fish).toBeNull()

        r = 2
        expect(result[r].Bones).toBe('pp')
        expect(result[r].Bish).toBeUndefined()
        expect(result[r].Fish).toBeCloseTo(0.07792207792207792, 10)

        done();
    })
})


describe('readFileWithHeaderTransformDeleteAndPascalCase', () => {
    it('should return data', async (done) => {
        expect.assertions(27)

        const filepath = path.join(__dirname, 'pascal.xlsx')

        const transform = {
            TransformMe: 'Bones'
        }

        const deletes = []
        const pascalWords = [ 'Grp', 'Rate' ]

        const result = await xlsx.readFileWithHeaderTransformDeleteAndPascalCase(filepath, transform, deletes, pascalWords)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(3)

        // ThisIsAHeader	ThisIsAnotherHeader	SomeGrp	CurRate	SgsHsc	LiveFree	Bones	One23Hello
        let r = 0
        expect(result[r].ThisIsAHeader).toBe('ThisIsAHeader')
        expect(result[r].ThisIsAnotherHeader).toBe('ThisIsAnotherHeader')
        expect(result[r].SomeGrp).toBe('SomeGrp')
        expect(result[r].CurRate).toBe('CurRate')
        expect(result[r].SgsHsc).toBe('SgsHsc')
        expect(result[r].LiveFree).toBe('LiveFree')
        expect(result[r].Bones).toBe('Bones')
        expect(result[r].One23Hello).toBe('One23Hello')

        r = 1
        expect(result[r].ThisIsAHeader).toBe(0)
        expect(result[r].ThisIsAnotherHeader).toBe(1)
        expect(result[r].SomeGrp).toBe(2)
        expect(result[r].CurRate).toBe(3)
        expect(result[r].SgsHsc).toBe(4)
        expect(result[r].LiveFree).toBe(5)
        expect(result[r].Bones).toBe(6)
        expect(result[r].One23Hello).toBe(7)

        r = 2
        expect(result[r].ThisIsAHeader).toBe(100)
        expect(result[r].ThisIsAnotherHeader).toBe(101)
        expect(result[r].SomeGrp).toBe(102)
        expect(result[r].CurRate).toBe(103)
        expect(result[r].SgsHsc).toBe(104)
        expect(result[r].LiveFree).toBe(105)
        expect(result[r].Bones).toBe(106)
        expect(result[r].One23Hello).toBe(107)

        done();
    })
})


describe('readFileWithHeaderTransformDeleteAndPascalCaseAndStringColumns', () => {
    it('should return leave Ocn strings alone', async (done) => {
        expect.assertions(13)

        const filepath = path.join(__dirname, 'stringColumns.xlsx')

        const transform = {
            TransformMe: 'Bones'
        }

        const deletes = []
        const pascalWords = [ 'Ocn' ]
        const stringColumns = [ 'Ocn' ]

        const result = await xlsx.readFileWithHeaderTransformDeleteAndPascalCaseAndStringColumns(filepath, transform, deletes, pascalWords, stringColumns)

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(9)

        // ThisIsAHeader	ThisIsAnotherHeader	SomeGrp	CurRate	SgsHsc	LiveFree	Bones	One23Hello
        let r = 0
        expect(result[r].NotOcn).toBe(123)
        expect(result[r].Ocn).toBe('123E')

        r = 1
        expect(result[r].NotOcn).toBe(5160)
        expect(result[r].Ocn).toBe('5160')

        r = 2
        expect(result[r].NotOcn).toBe(123)
        expect(result[r].Ocn).toBe('0123')

        r = 3
        expect(result[r].NotOcn).toBe(1234)
        expect(result[r].Ocn).toBe('1234')

        r = 8
        expect(result[r].NotOcn).toBe(123456789)
        expect(result[r].Ocn).toBe('123456789')

        done();
    })
})

// describe('namespace issue', () => {
//     it('should stop sucking', async (done) => {
//         expect.assertions(5)
//
//         const filepath = '/Users/mjb/Desktop/abc.xlsx'
//         const result = await xlsx.readFile(filepath)
//
//         expect(result).toBeTruthy();
//         expect(Array.isArray(result)).toBeTruthy();
//         expect(result.length).toBe(5)
//
//         expect(result[0].A).toBeCloseTo(0.001, 10)
//         expect(result[1].A).toBeCloseTo(0.001, 10)
//
//         done();
//     }, 99999999)
// })
