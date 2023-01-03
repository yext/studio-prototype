import { ArrowFunction, FunctionDeclaration, SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
} from "../types";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import ComponentTreeHelpers from "../utils/ComponentTreeHelpers";

/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (e.g. ModuleFile or PageFile).
 */
export default class ReactComponentFileWriter {
  constructor(
    private componentName: string,
    private studioSourceFileWriter: StudioSourceFileWriter,
    private studioSourceFileParser: StudioSourceFileParser
  ) {}

  private createProps(props: PropValues): string {
    let propsString = "";
    Object.keys(props).forEach((propName) => {
      const propType = props[propName].valueType;
      const val = props[propName].value;
      if (
        props[propName].kind === PropValueKind.Literal &&
        (propType === PropValueType.string ||
          propType === PropValueType.HexColor)
      ) {
        propsString += `${propName}='${val}' `;
      } else {
        propsString += `${propName}={${val}} `;
      }
    });
    return propsString;
  }

  private createReturnStatement(componentTree: ComponentState[]): string {
    const elements = ComponentTreeHelpers.mapComponentTree<string>(
      componentTree,
      (c, children): string => {
        if (c.kind === ComponentStateKind.Fragment) {
          return "<>\n" + children.join("\n") + "</>";
        } else if (children.length === 0) {
          return `<${c.componentName} ` + this.createProps(c.props) + "/>";
        } else {
          return (
            `<${c.componentName} ` +
            this.createProps(c.props) +
            ">\n" +
            children.join("\n") +
            `</${c.componentName}>`
          );
        }
      }
    ).join("\n");
    return `return (${elements})`;
  }

  private updateReturnStatement(
    functionComponent: FunctionDeclaration | ArrowFunction,
    componentTree: ComponentState[]
  ) {
    const returnStatementIndex = functionComponent
      .getDescendantStatements()
      .findIndex((n) => n.isKind(SyntaxKind.ReturnStatement));
    if (returnStatementIndex < 0) {
      throw new Error(
        `No return statement found at page: "${this.studioSourceFileParser.getFilepath()}"`
      );
    }
    const newReturnStatement = this.createReturnStatement(componentTree);
    functionComponent.removeStatement(returnStatementIndex);
    functionComponent.addStatements(newReturnStatement);
  }

  private updatePropInterface(propShape: PropShape) {
    const interfaceName = `${this.componentName}Props`;
    const properties = Object.entries(propShape).map(([key, value]) => ({
      name: key,
      type: value.type,
      hasQuestionToken: true,
      ...(value.doc && { docs: [value.doc] }),
    }));
    this.studioSourceFileWriter.updateInterface(interfaceName, properties);
  }

  private updateInitialProps(initialProps: PropValues) {
    this.studioSourceFileWriter.updateVariableStatement(
      "initialProps",
      this.studioSourceFileWriter.createPropsObjectLiteralWriter(initialProps),
      `${this.componentName}Props`
    );
  }

  /**
   * Update a React component file, which include:
   * - file imports
   * - const variable "initialProps"
   * - component's prop interface `${componentName}Props`
   * - component's parameter and return statement
   */
  updateFile({
    componentTree,
    fileMetadata,
    cssImports,
    onFileUpdate,
  }: {
    componentTree: ComponentState[];
    fileMetadata?: FileMetadata;
    cssImports?: string[];
    onFileUpdate?: (
      functionComponent: FunctionDeclaration | ArrowFunction
    ) => void;
  }): void {
    const defaultExport =
      this.studioSourceFileParser.getDefaultExportReactComponent();
    const functionComponent = defaultExport.isKind(
      SyntaxKind.VariableDeclaration
    )
      ? defaultExport.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
      : defaultExport;

    onFileUpdate?.(functionComponent);
    if (fileMetadata) {
      const { initialProps, propShape } = fileMetadata;
      if (initialProps) {
        this.updateInitialProps(initialProps);
      }
      if (propShape) {
        this.updatePropInterface(propShape);
        this.studioSourceFileWriter.updateFunctionParameter(
          functionComponent,
          Object.keys(propShape),
          `${this.componentName}Props`
        );
      }
    }
    this.updateReturnStatement(functionComponent, componentTree);
    this.studioSourceFileWriter.updateFileImports(cssImports);
    this.studioSourceFileWriter.writeToFile();
  }
}
