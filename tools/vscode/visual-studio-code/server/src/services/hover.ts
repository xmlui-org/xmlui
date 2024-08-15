import { ParseResult } from '../xmlui-parser/parser';
import { findTokenAtPos } from '../xmlui-parser/utils';
import { SyntaxKind, getSyntaxKindStrRepr } from '../xmlui-parser/syntax-kind';

type SimpleHover = {
  value: string;
  range: {
    pos: number;
    end: number;
  };
};

/**
 * @returns The hover content string
 */
export function handleHover(
  { node }: ParseResult,
  position: number,
): SimpleHover {
  const findRes = findTokenAtPos(node, position);
  let value: string= '';
  let pos: number = position;
  let end: number= 0;

  if (findRes === undefined) {
    return { value , range: {pos: position, end: end} };
  }
  const { chainBeforePos, chainAtPos, sharedParents} = findRes;

  const atKind = chainAtPos[chainAtPos.length -1].kind

  if (chainBeforePos === undefined) {
  } else {
    const kindBefore = chainBeforePos[chainBeforePos.length - 1].kind;
    
    switch (kindBefore){
      case SyntaxKind.OpenNodeStart:
        
    }
  }
  return {value, range: {pos: pos, end: end}};
}
