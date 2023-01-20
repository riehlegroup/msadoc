import {
  ExpressionNode,
  ExpressionNodeType,
  AndNode as SEPAndNode,
  KeyValueNode as SEPKeyValueNode,
  NotNode as SEPNotNode,
  OrNode as SEPOrNode,
  ValueNode as SEPValueNode,
  parse,
} from 'search-expression-parser';

import { Result } from '../../../../models/result';

import {
  FilterAndNode,
  FilterKeyValueNode,
  FilterNode,
  FilterNotNode,
  FilterOrNode,
  FilterParseError,
  isAllowedLiteralNodeKey,
} from './models';

export function parseFilterQuery(
  query: string,
): Result<FilterNode, FilterParseError> {
  const parserResult = parse(query);
  if (!parserResult.success) {
    return {
      success: false,
      error: {
        errorMessages: [],
      },
    };
  }

  return transformToInternalRepresentation(parserResult.data);
}

function transformToInternalRepresentation(
  node: ExpressionNode,
): Result<FilterNode, FilterParseError> {
  switch (node.type) {
    case ExpressionNodeType.And:
      return transformAndNodeToInternalRepresentation(node);
    case ExpressionNodeType.Or:
      return transformOrNodeToInternalRepresentation(node);
    case ExpressionNodeType.Not:
      return transformNotNodeToInternalRepresentation(node);
    case ExpressionNodeType.KeyValue:
      return transformKeyValueNodeToInternalRepresentation(node);
    case ExpressionNodeType.Value:
      return transformValueNodeToInternalRepresentation(node);
  }
}

function transformAndNodeToInternalRepresentation(
  node: SEPAndNode,
): Result<FilterAndNode, FilterParseError> {
  const leftChildResult = transformToInternalRepresentation(node.leftChild);
  const rightChildResult = transformToInternalRepresentation(node.rightChild);

  if (leftChildResult.success && rightChildResult.success) {
    return {
      success: true,
      data: {
        type: ExpressionNodeType.And,
        leftChild: leftChildResult.data,
        rightChild: rightChildResult.data,
      },
    };
  }

  const errorMessages: string[] = [];
  if (!leftChildResult.success) {
    errorMessages.push(...leftChildResult.error.errorMessages);
  }
  if (!rightChildResult.success) {
    errorMessages.push(...rightChildResult.error.errorMessages);
  }

  return {
    success: false,
    error: {
      errorMessages: errorMessages,
    },
  };
}

function transformOrNodeToInternalRepresentation(
  node: SEPOrNode,
): Result<FilterOrNode, FilterParseError> {
  const leftChildResult = transformToInternalRepresentation(node.leftChild);
  const rightChildResult = transformToInternalRepresentation(node.rightChild);

  if (leftChildResult.success && rightChildResult.success) {
    return {
      success: true,
      data: {
        type: ExpressionNodeType.Or,
        leftChild: leftChildResult.data,
        rightChild: rightChildResult.data,
      },
    };
  }

  const errorMessages: string[] = [];
  if (!leftChildResult.success) {
    errorMessages.push(...leftChildResult.error.errorMessages);
  }
  if (!rightChildResult.success) {
    errorMessages.push(...rightChildResult.error.errorMessages);
  }

  return {
    success: false,
    error: {
      errorMessages: errorMessages,
    },
  };
}

function transformNotNodeToInternalRepresentation(
  node: SEPNotNode,
): Result<FilterNotNode, FilterParseError> {
  const childResult = transformToInternalRepresentation(node.child);

  if (childResult.success) {
    return {
      success: true,
      data: {
        type: ExpressionNodeType.Not,
        child: childResult.data,
      },
    };
  }

  return childResult;
}

function transformKeyValueNodeToInternalRepresentation(
  node: SEPKeyValueNode,
): Result<FilterKeyValueNode, FilterParseError> {
  const key = node.key.content.toLowerCase();
  if (!isAllowedLiteralNodeKey(key)) {
    return {
      success: false,
      error: {
        errorMessages: [`Unknown key "${node.key.content}".`],
      },
    };
  }

  return {
    success: true,
    data: {
      type: ExpressionNodeType.KeyValue,

      key: key,
      value: node.value.content,
    },
  };
}

function transformValueNodeToInternalRepresentation(
  node: SEPValueNode,
): Result<FilterKeyValueNode, FilterParseError> {
  return {
    success: false,
    error: {
      errorMessages: [
        `Expression "${node.value.content}" is not following the "key:value" format.`,
      ],
    },
  };
}
