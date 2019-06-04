/*
 * Based on [https://github.com/vtrushin/json-to-ast](https://github.com/vtrushin/json-to-ast)
 * MIT Copyright (C) 2016 by Vlad Trushin
 */

const constants = require('./constants');

const TOKEN_TYPES = constants.TOKEN_TYPES;
const PUNCTUATOR_TOKENS_MAP = constants.PUNCTUATOR_TOKENS_MAP;
const PUNCTUATOR_TOKENS_MAP_STR = constants.PUNCTUATOR_TOKENS_MAP_STR;
const KEYWORD_TOKENS_MAP = constants.KEYWORD_TOKENS_MAP;
const TOKEN_TYPES_STR = constants.TOKEN_TYPES_STR;

const NUMBER_STATES = {
  _START_: 0,
  MINUS: 1,
  ZERO: 2,
  DIGIT: 3,
  POINT: 4,
  DIGIT_FRACTION: 5,
  EXP: 6,
  EXP_DIGIT_OR_SIGN: 7
};


// HELPERS

function isDigit1to9(char) {
  return char >= '1' && char <= '9';
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isHex(char) {
  return (
    isDigit(char)
    || (char >= 'a' && char <= 'f')
    || (char >= 'A' && char <= 'F')
  );
}

function isExp(char) {
  return char === 'e' || char === 'E';
}

function parseChar(char, current) {
  if (char in PUNCTUATOR_TOKENS_MAP) {
    return {
      type: PUNCTUATOR_TOKENS_MAP[char],
      type_str: PUNCTUATOR_TOKENS_MAP_STR[char],
      current: current + 1,
      value: null
    };
  }

  return null;
}

function parseKeyword(char, current) {
  for (const name in KEYWORD_TOKENS_MAP) {
    if (KEYWORD_TOKENS_MAP.hasOwnProperty(name) && char.substr(current, name.length) === name) {
      return {
        type: KEYWORD_TOKENS_MAP[name],
        type_str: PUNCTUATOR_TOKENS_MAP_STR[char],
        current: current + name.length,
        value: name
      };
    }
  }

  return null;
}

function parseString(char, current) {
  return null;
}

function parseNumber(input, index) {
  const startIndex = index;
  let passedValueIndex = index;
  let state = NUMBER_STATES._START_;

  iterator: while (index < input.length) {
    const char = input.charAt(index);

    switch (state) {
      case NUMBER_STATES._START_: {
        if (char === '-') {
          state = NUMBER_STATES.MINUS;
        } else if (char === '0') {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.ZERO;
        } else if (isDigit1to9(char)) {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.DIGIT;
        } else {
          return null;
        }
        break;
      }

      case NUMBER_STATES.MINUS: {
        if (char === '0') {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.ZERO;
        } else if (isDigit1to9(char)) {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.DIGIT;
        } else {
          return null;
        }
        break;
      }

      case NUMBER_STATES.ZERO: {
        if (char === '.') {
          state = NUMBER_STATES.POINT;
        } else if (isExp(char)) {
          state = NUMBER_STATES.EXP;
        } else {
          break iterator;
        }
        break;
      }

      case NUMBER_STATES.DIGIT: {
        if (isDigit(char)) {
          passedValueIndex = index + 1;
        } else if (char === '.') {
          state = NUMBER_STATES.POINT;
        } else if (isExp(char)) {
          state = NUMBER_STATES.EXP;
        } else {
          break iterator;
        }
        break;
      }

      case NUMBER_STATES.POINT: {
        if (isDigit(char)) {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.DIGIT_FRACTION;
        } else {
          break iterator;
        }
        break;
      }

      case NUMBER_STATES.DIGIT_FRACTION: {
        if (isDigit(char)) {
          passedValueIndex = index + 1;
        } else if (isExp(char)) {
          state = NUMBER_STATES.EXP;
        } else {
          break iterator;
        }
        break;
      }

      case NUMBER_STATES.EXP: {
        if (char === '+' || char === '-') {
          state = NUMBER_STATES.EXP_DIGIT_OR_SIGN;
        } else if (isDigit(char)) {
          passedValueIndex = index + 1;
          state = NUMBER_STATES.EXP_DIGIT_OR_SIGN;
        } else {
          break iterator;
        }
        break;
      }

      case NUMBER_STATES.EXP_DIGIT_OR_SIGN: {
        if (isDigit(char)) {
          passedValueIndex = index + 1;
        } else {
          break iterator;
        }
        break;
      }
    }

    index++;
  }

  if (passedValueIndex > 0) {
    return {
      type: TOKEN_TYPES.NUMBER,
      type_str: TOKEN_TYPES_STR.NUMBER,
      current: passedValueIndex,
      value: input.slice(startIndex, passedValueIndex)
    };
  }

  return null;
}


function parseWhitespace(input, index) {
  const char = input.charAt(index);

  if (char === '\r') { // CR (Unix)
    index ++;
    if (input.charAt(index) === '\n') { // CRLF (Windows)
      index ++;
    }
  } else if (char === '\n') { // LF (MacOS)
    index ++;
  } else if (char === '\t' || char === ' ') {
    index ++;
  } else {
    return null;
  }

  return {
    current: index
  };
}

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    const whitespace = parseWhitespace(input, current);

    if (whitespace) {
      current = whitespace.current;
      continue;
    }

    let matched =
      parseChar(char, current)
      || parseKeyword(input, current)
      || parseString(input, current)
      || parseNumber(input, current);

    if (matched) {
      const token = {
        type_str: matched.type_str,
        type: matched.type,
        value: matched.value
      };

      tokens.push(token);
      current = matched.current;
    } else {
      current++;
    }
  }

  return tokens;
}

module.exports = tokenizer;
