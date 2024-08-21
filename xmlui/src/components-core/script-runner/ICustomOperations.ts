export enum CustomOperationType {
  MemberAccess,
  CalculatedMemberAccess,
  UnaryPlus,
  UnaryMinus,
  LogicalNot,
  BitwiseNot,
  Multiply,
  Divide,
  Remainder,
  Add,
  Subtract,
  SignedRightShift,
  UnsignedRightShift,
  LeftShift,
  LessThan,
  LessThanOrEqual,
  GreaterThan,
  GreaterThanOrEqual,
  Equal,
  StrictEqual,
  NotEqual,
  StrictNotEqual,
  BitwiseAnd,
  BitwiseXor,
  BitwiseOr,
  LogicalAnd,
  LogicalOr,
  NullCoalesce
}

/**
 * Defines custom operations that can be used in binding expressions instead of the standard operations
 */
export interface ICustomOperations {
  /**
   * Determines if the particular operation supports the given second operand
   * @param operationType Operation type
   * @param secondOperand Value of the second operand
   */
  supportSecondOperand(operationType: CustomOperationType, secondOperand: any): boolean;

  /**
   * Custom member access operator: parent.memberName
   * @param parent Parent object
   * @param member Member name
   */
  memberAccess?: (parent: any, member: string) => any;

  /**
   * Custom member access operator: parent[memberObj]
   * @param parent Parent object
   * @param memberObj Member object
   */
  calculatedMemberAccess?: (parent: any, memberObj: any) => any;

  /**
   * Unary plus operator: +operand
   * @param operand Operand
   */
  unaryPlus?: (operand: any) => any;

  /**
   * Unary minus operator: -operand
   * @param operand Operand
   */
  unaryMinus?: (operand: any) => any;

  /**
   * Logical NOT operator: !operand
   * @param operand Operand
   */
  logicalNot?: (operand: any) => any;

  /**
   * Bitwise NOT operator: ~operand
   * @param operand Operand
   */
  bitwiseNot?: (operand: any) => any;

  /**
   * Binary multiplication: a * b
   * @param a First operand
   * @param b Second operand
   */
  multiply?: (a: any, b: any) => any;

  /**
   * Binary division: a / b
   * @param a First operand
   * @param b Second operand
   */
  divide?: (a: any, b: any) => any;

  /**
   * Binary remainder: a % b
   * @param a First operand
   * @param b Second operand
   */
  remainder?: (a: any, b: any) => any;

  /**
   * Binary addition: a + b
   * @param a First operand
   * @param b Second operand
   */
  add?: (a: any, b: any) => any;

  /**
   * Binary subtraction: a - b
   * @param a First operand
   * @param b Second operand
   */
  subtract?: (a: any, b: any) => any;

  /**
   * Signed right shift: a >>> b
   * @param a First operand
   * @param b Second operand
   */
  signedRightShift?: (a: any, b: any) => any;

  /**
   * Unsigned right shift: a >> b
   * @param a First operand
   * @param b Second operand
   */
  unsignedRightShift?: (a: any, b: any) => any;

  /**
   * Left shift: a << b
   * @param a First operand
   * @param b Second operand
   */
  leftShift?: (a: any, b: any) => any;

  /**
   * Less than: a < b
   * @param a First operand
   * @param b Second operand
   */
  lessThan?: (a: any, b: any) => any;

  /**
   * Less than or equal: a <= b
   * @param a First operand
   * @param b Second operand
   */
  lessThanOrEqual?: (a: any, b: any) => any;

  /**
   * Greater than: a > b
   * @param a First operand
   * @param b Second operand
   */
  greaterThan?: (a: any, b: any) => any;

  /**
   * Greater than: a >= b
   * @param a First operand
   * @param b Second operand
   */
  greaterThanOrEqual?: (a: any, b: any) => any;

  /**
   * Equal: a == b
   * @param a First operand
   * @param b Second operand
   */
  equal?: (a: any, b: any) => any;

  /**
   * Strict equal: a === b
   * @param a First operand
   * @param b Second operand
   */
  strictEqual?: (a: any, b: any) => any;

  /**
   * Not equal: a != b
   * @param a First operand
   * @param b Second operand
   */
  notEqual?: (a: any, b: any) => any;

  /**
   * Strict not equal: a != b
   * @param a First operand
   * @param b Second operand
   */
  strictNotEqual?: (a: any, b: any) => any;

  /**
   * Bitwise AND: a & b
   * @param a First operand
   * @param b Second operand
   */
  bitwiseAnd?: (a: any, b: any) => any;

  /**
   * Bitwise XOR: a ^ b
   * @param a First operand
   * @param b Second operand
   */
  bitwiseXor?: (a: any, b: any) => any;

  /**
   * Bitwise OR: a | b
   * @param a First operand
   * @param b Second operand
   */
  bitwiseOr?: (a: any, b: any) => any;

  /**
   * Logical AND: a && b
   * @param a First operand
   * @param b Second operand
   */
  logicalAnd?: (a: any, b: any) => any;

  /**
   * Logical OR: a || b
   * @param a First operand
   * @param b Second operand
   */
  logicalOr?: (a: any, b: any) => any;

  /**
   * Null coalesce operation: a ?? b
   * @param a First operand
   * @param b Second operand
   */
  nullCoalesce?: (a: any, b: any) => any;
}
