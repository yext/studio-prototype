import { SyntaxKind } from "ts-morph";
import { PropValueType } from "../../lib";
import TypeNodeParsingHelper, {
  ParsedTypeKind,
} from "../../src/parsers/helpers/ShapeParsingHelper";
import createTestSourceFile from "../__utils__/createTestSourceFile";

const externalShapeParser = jest.fn();

it("can parse a string union type", () => {
  const { sourceFile } = createTestSourceFile(
    `export interface MyProps {
      fruit: 'apple' | 'pear',
  }`
  );
  const interfaceDeclaration = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.InterfaceDeclaration
  );
  const parsedShape = TypeNodeParsingHelper.parseShape(
    interfaceDeclaration,
    externalShapeParser
  );
  expect(parsedShape.type).toEqual({
    fruit: {
      kind: ParsedTypeKind.Simple,
      type: PropValueType.string,
      unionValues: ["apple", "pear"],
      required: true,
    },
  });
});

it("errors for unions of non strings", () => {
  const { sourceFile } = createTestSourceFile(
    `export interface MyProps {
      fruit: 1 | 2,
  }`
  );
  const interfaceDeclaration = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.InterfaceDeclaration
  );
  expect(() =>
    TypeNodeParsingHelper.parseShape(interfaceDeclaration, externalShapeParser)
  ).toThrowError(
    'Union types only support strings. Found a NumericLiteral within "fruit".'
  );
});

it("can parse a type literal", () => {
  const { sourceFile } = createTestSourceFile(
    `export type MyProps = {
      fruit: string
  }`
  );
  const typeAlias = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.TypeAliasDeclaration
  );
  const parsedShape = TypeNodeParsingHelper.parseShape(
    typeAlias,
    externalShapeParser
  );
  expect(parsedShape.type).toEqual({
    fruit: {
      kind: ParsedTypeKind.Simple,
      type: "string",
      required: true,
    },
  });
});
