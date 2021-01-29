import { languages } from 'monaco-editor';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import IRichLanguageConfiguration = languages.LanguageConfiguration;
import ILanguage = languages.IMonarchLanguage;

export const conf: IRichLanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*#pragma\\s+region\\b'),
      end: new RegExp('^\\s*#pragma\\s+endregion\\b'),
    },
  },
};

export const language = {
  defaultToken: '',
  tokenPostfix: '.cpp',

  brackets: [
    { token: 'delimiter.curly', open: '{', close: '}' },
    { token: 'delimiter.parenthesis', open: '(', close: ')' },
    { token: 'delimiter.square', open: '[', close: ']' },
    { token: 'delimiter.angle', open: '<', close: '>' },
  ],

  keywords: [
    'discard',
    'length',
    'smoothstep',
    'uniform',
    'precision',
    'mediump',
    'highp',
    'vec2',
    'vec3',
    'vec4',
    'ivec2',
    'ivec3',
    'ivec4',
    'abstract',
    'amp',
    'array',
    'auto',
    'bool',
    'break',
    'case',
    'catch',
    'char',
    'class',
    'const',
    'gl_FragColor',
    'constexpr',
    'const_cast',
    'continue',
    'cpu',
    'decltype',
    'default',
    'delegate',
    'delete',
    'do',
    'double',
    'dynamic_cast',
    'each',
    'else',
    'enum',
    'event',
    'explicit',
    'export',
    'extern',
    'false',
    'final',
    'finally',
    'float',
    'for',
    'friend',
    'gcnew',
    'generic',
    'goto',
    'if',
    'in',
    'initonly',
    'inline',
    'int',
    'interface',
    'interior_ptr',
    'internal',
    'literal',
    'long',
    'mutable',
    'namespace',
    'new',
    'noexcept',
    'nullptr',
    '__nullptr',
    'operator',
    'override',
    'partial',
    'pascal',
    'pin_ptr',
    'private',
    'property',
    'protected',
    'public',
    'ref',
    'register',
    'reinterpret_cast',
    'restrict',
    'return',
    'safe_cast',
    'sealed',
    'short',
    'signed',
    'sizeof',
    'static',
    'static_assert',
    'static_cast',
    'struct',
    'switch',
    'template',
    'this',
    'thread_local',
    'throw',
    'tile_static',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'unsigned',
    'using',
    'virtual',
    'void',
    'volatile',
    'wchar_t',
    'where',
    'while',
  ],

  typeKeywords: 'float int bool void\nvec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4\nmat2 mat3 mat4\nsampler2D sampler3D samplerCube\nconst attribute uniform varying'.split(
    /\s+/
  ),

  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '<<',
    '>>',
    '>>>',
    '+=',
    '-=',
    '*=',
    '/=',
    '&=',
    '|=',
    '^=',
    '%=',
    '<<=',
    '>>=',
    '>>>=',
  ],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*/^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  integersuffix: /(ll|LL|u|U|l|L)?(ll|LL|u|U|l|L)?/,
  floatsuffix: /[fFlL]?/,
  encoding: /u|u8|U|L/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // C++ 11 Raw String
      [
        /@encoding?R"(?:([^ ()\\\t]*))\(/,
        { token: 'string.raw.begin', next: '@raw.$1' },
      ],

      // identifiers and keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@typeKeywords': 'keyword',
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
      [/[A-Z][\w$]*/, 'type.identifier'], // to show class names nicely

      // whitespace
      { include: '@whitespace' },

      // [[ attributes ]].
      [/\[\[.*\]\]/, 'annotation'],

      [
        /^\s*#include/,
        { token: 'keyword.directive.include', next: '@include' },
      ],

      // Preprocessor directive
      [/^\s*#\s*\w+/, 'keyword'],

      // delimiters and operators
      [/[{}()[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'delimiter',
            '@default': '',
          },
        },
      ],

      // numbers
      [/\d*\d+[eE]([-+]?\d+)?(@floatsuffix)/, 'number.float'],
      [/\d*\.\d+([eE][-+]?\d+)?(@floatsuffix)/, 'number.float'],
      [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
      [/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
      [/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
      [/\d[\d']*\d(@integersuffix)/, 'number'],
      [/\d(@integersuffix)/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, 'string', '@string'],

      // characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid'],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*\*(?!\/)/, 'comment.doc', '@doccomment'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment'],
    ],
    //Identical copy of comment above, except for the addition of .doc
    doccomment: [
      [/[^/*]+/, 'comment.doc'],
      [/\*\//, 'comment.doc', '@pop'],
      [/[/*]/, 'comment.doc'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop'],
    ],

    raw: [
      [
        /(.*)(\))(?:([^ ()\\\t]*))(")/,
        {
          cases: {
            '$3==$S2': [
              'string.raw',
              'string.raw.end',
              'string.raw.end',
              { token: 'string.raw.end', next: '@pop' },
            ],
            '@default': [
              'string.raw',
              'string.raw',
              'string.raw',
              'string.raw',
            ],
          },
        },
      ],
      [/.*/, 'string.raw'],
    ],

    include: [
      [
        /(\s*)(<)([^<>]*)(>)/,
        [
          '',
          'keyword.directive.include.begin',
          'string.include.identifier',
          { token: 'keyword.directive.include.end', next: '@pop' },
        ],
      ],
      [
        /(\s*)(")([^"]*)(")/,
        [
          '',
          'keyword.directive.include.begin',
          'string.include.identifier',
          { token: 'keyword.directive.include.end', next: '@pop' },
        ],
      ],
    ],
  },
} as ILanguage;
