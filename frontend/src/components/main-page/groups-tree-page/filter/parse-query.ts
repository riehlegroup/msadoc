/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import ohm from 'ohm-js';

import { Result } from '../../../../models/result';

import { FilterNode, FilterNodeType, allowedLiteralNodeKeys } from './models';

/*
  Regarding operator precedence:
  We want "NOT" to bind tighter than "AND". And we want "AND" to bind tighter than "OR".
  To achieve this, we follow the idea of the Ohm example regarding math arithmetics, which basically says that the weaker binding operators should come first and "call" the stronger-binding ones.
  In the math example, the following is defined:
  Exp
    = AddExp

  AddExp
    = AddExp "+" MulExp  -- plus
    | AddExp "-" MulExp  -- minus
    | MulExp

  MulExp
    = MulExp "*" ExpExp  -- times
    | MulExp "/" ExpExp  -- divide
    | ExpExp

  Here, we use the same structure, but of course with "OR", "AND", and "NOT".
*/

const allowedKeysPreparedForGrammar = allowedLiteralNodeKeys.map(
  (singleKey) => `caseInsensitive<"${singleKey}">`,
);

const grammarSource = String.raw`
  MyGrammar {
    Exp 
      = OrExpression

    OrExpression 
      = OrExpression caseInsensitive<"OR"> AndExpression -- recurse
      | AndExpression                                    -- passthrough

    AndExpression 
      = AndExpression caseInsensitive<"AND"> NotExpression -- recurseWithExplicitAnd
      | AndExpression NotExpression                        -- recurseWithImplicitAnd
      | NotExpression                                      -- passthrough

    NotExpression 
      = caseInsensitive<"NOT"> SingleExpression -- default
      | SingleExpression                        -- passthrough

    SingleExpression 
      = "(" Exp ")"                                   -- brackets
      | SingleExpressionKey ":" SingleExpressionValue -- default

    SingleExpressionKey 
      = ${allowedKeysPreparedForGrammar.join('|')}

    SingleExpressionValue 
      = SingleExpressionValueWithoutQuotes | SingleExpressionValueWithQuotes

    // A value that is not enclosed in double quotes. We allow any string that does not contain double quotes, round brackets, or spaces.
    SingleExpressionValueWithoutQuotes 
      = #((~"\"" ~"(" ~")" ~space any)+)

    // A value that is enclosed in double quotes. We allow any string within this (except for double quotes of course, since they terminate this string).
    SingleExpressionValueWithQuotes 
      = #("\""(~"\"" any)+"\"")
  }
  `;

const grammar = ohm.grammar(grammarSource);

const semantics = grammar
  .createSemantics()
  .addOperation<FilterNode | string>('eval', {
    Exp(a): FilterNode {
      return a.eval();
    },
    OrExpression_recurse(a, _b, c): FilterNode {
      return {
        type: FilterNodeType.Or,
        leftChild: a.eval(),
        rightChild: c.eval(),
      };
    },
    OrExpression_passthrough(a): FilterNode {
      return a.eval();
    },
    AndExpression_recurseWithExplicitAnd(a, _b, c): FilterNode {
      return {
        type: FilterNodeType.And,
        leftChild: a.eval(),
        rightChild: c.eval(),
      };
    },
    AndExpression_recurseWithImplicitAnd(a, b): FilterNode {
      return {
        type: FilterNodeType.And,
        leftChild: a.eval(),
        rightChild: b.eval(),
      };
    },
    AndExpression_passthrough(a): FilterNode {
      return a.eval();
    },
    NotExpression_default(_a, b): FilterNode {
      return {
        type: FilterNodeType.Not,
        child: b.eval(),
      };
    },
    NotExpression_passthrough(a): FilterNode {
      return a.eval();
    },
    SingleExpression_brackets(_a, b, _c): FilterNode {
      return b.eval();
    },
    SingleExpression_default(a, _b, c): FilterNode {
      return {
        type: FilterNodeType.Literal,
        key: a.eval(),
        value: c.eval(),
      };
    },
    SingleExpressionKey(a): string {
      // We use ".toLowerCase()" because we allow users to also use uppercase keys.
      return a.sourceString.toLowerCase();
    },
    SingleExpressionValue(a): string {
      return a.eval();
    },
    SingleExpressionValueWithoutQuotes(a): string {
      return a.sourceString;
    },
    SingleExpressionValueWithQuotes(_a, b, _c): string {
      return b.sourceString;
    },
  });

export function parseFilterQuery(query: string): Result<FilterNode> {
  const matchResult = grammar.match(query);
  if (!matchResult.succeeded()) {
    return { success: false };
  }

  const filterTree = semantics(matchResult).eval();

  return {
    success: true,
    data: filterTree,
  };
}
