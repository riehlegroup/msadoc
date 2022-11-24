import { FilterNode, FilterNodeType } from './models';
import { parseFilterQuery } from './parse-query';

interface TestExpectedToSucceed {
  testDescription: string;
  query: string;
  expectedResult: FilterNode;
}

const TESTS_EXPECTED_TO_SUCCEED: TestExpectedToSucceed[] = [
  {
    testDescription: 'should parse a single key-value pair',
    query: 'name:foo',
    expectedResult: { type: FilterNodeType.Literal, key: 'name', value: 'foo' },
  },
  {
    testDescription: 'should allow whitespace in quotes',
    query: 'name:"foo bar"',
    expectedResult: {
      type: FilterNodeType.Literal,
      key: 'name',
      value: 'foo bar',
    },
  },
  {
    testDescription: 'should allow special characters',
    query: 'name:foo-_*&baz',
    expectedResult: {
      type: FilterNodeType.Literal,
      key: 'name',
      value: 'foo-_*&baz',
    },
  },
  {
    testDescription: 'should properly treat an explicit "AND"',
    query: 'name:foo AND tag:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription: 'should properly treat an implicit "AND"',
    query: 'name:foo tag:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription: 'should properly treat an "OR"',
    query: 'name:foo OR tag:bar',
    expectedResult: {
      type: FilterNodeType.Or,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription: 'should properly treat a "NOT"',
    query: 'NOT name:foo',
    expectedResult: {
      type: FilterNodeType.Not,
      child: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
    },
  },
  {
    testDescription: 'should bind "NOT" tighter than "AND"',
    query: 'NOT name:foo AND tag:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Not,
        child: {
          type: FilterNodeType.Literal,
          key: 'name',
          value: 'foo',
        },
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription: 'should bind "AND" tighter than "OR"',
    query: 'tag:baz OR name:foo AND tag:bar',
    expectedResult: {
      type: FilterNodeType.Or,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'baz',
      },
      rightChild: {
        type: FilterNodeType.And,
        leftChild: {
          type: FilterNodeType.Literal,
          key: 'name',
          value: 'foo',
        },
        rightChild: {
          type: FilterNodeType.Literal,
          key: 'tag',
          value: 'bar',
        },
      },
    },
  },
  {
    testDescription:
      'should properly handle brackets to explicitly define the operator precedence',
    query: '(tag:baz OR name:foo) AND tag:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Or,
        leftChild: {
          type: FilterNodeType.Literal,
          key: 'tag',
          value: 'baz',
        },
        rightChild: {
          type: FilterNodeType.Literal,
          key: 'name',
          value: 'foo',
        },
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },

  // Tests regarding additional spaces and the like.

  {
    testDescription: 'should successfully parse if there are additional spaces',
    query: '  name  : foo         AND       tag: bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription: 'should successfully parse if a lowercase "AND" is used',
    query: 'name:foo and tag:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
  {
    testDescription:
      'should successfully parse if keys use uppercase characters',
    query: 'NamE:foo and TAG:bar',
    expectedResult: {
      type: FilterNodeType.And,
      leftChild: {
        type: FilterNodeType.Literal,
        key: 'name',
        value: 'foo',
      },
      rightChild: {
        type: FilterNodeType.Literal,
        key: 'tag',
        value: 'bar',
      },
    },
  },
];

interface TestExpectedToFail {
  testDescription: string;
  query: string;
}

const TESTS_EXPECTED_TO_FAIL: TestExpectedToFail[] = [
  {
    testDescription: 'should fail when trying to parse an empty string',
    query: '',
  },
  {
    testDescription: 'should fail when trying to parse a key without a value',
    query: 'name:foo tag:',
  },
  {
    testDescription: 'should fail when trying to use an unknown key',
    query: 'foo:bar',
  },
  {
    testDescription: 'should fail when using empty brackets',
    query: 'foo:bar AND ()',
  },
];

for (const singleTest of TESTS_EXPECTED_TO_SUCCEED) {
  it(`${singleTest.testDescription} (query: "${singleTest.query}")`, () => {
    const parseResult = parseFilterQuery(singleTest.query);
    expect(parseResult.success).toEqual(true);
    if (!parseResult.success) {
      return;
    }

    expect(parseResult.data).toEqual(singleTest.expectedResult);
  });
}

for (const singleTest of TESTS_EXPECTED_TO_FAIL) {
  it(`${singleTest.testDescription} (query: "${singleTest.query}")`, () => {
    const parseResult = parseFilterQuery(singleTest.query);
    expect(parseResult.success).toEqual(false);
  });
}
