import { ReactComponent as Box } from "../../icons/box.svg";
import { ReactComponent as Container } from "../../icons/container.svg";
import { ElementType } from "../AddElementMenu/AddElementMenu";

/**
 * Returns the Icon that represents the provided Element Type.
 */
export default function renderIconForType(type: ElementType) {
  switch (type) {
    case ElementType.Components:
      return <Box />;
    case ElementType.Containers:
    case ElementType.Layouts:
      return <Container />;
    default:
      console.error(`Could not find Icon for type ${type}`);
      return null;
  }
}
